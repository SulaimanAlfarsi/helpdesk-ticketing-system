package com.example.helpdesk.service;

import com.example.helpdesk.dto.AddCommentRequest;
import com.example.helpdesk.dto.AgentResponse;
import com.example.helpdesk.dto.AssignTicketRequest;
import com.example.helpdesk.dto.AverageResolutionTimeResponse;
import com.example.helpdesk.dto.CommentResponse;
import com.example.helpdesk.dto.CreateTicketRequest;
import com.example.helpdesk.dto.TicketResponse;
import com.example.helpdesk.dto.TicketStatusHistoryResponse;
import com.example.helpdesk.dto.UpdateTicketStatusRequest;
import com.example.helpdesk.dto.UserResponse;
import com.example.helpdesk.entity.Agent;
import com.example.helpdesk.entity.Comment;
import com.example.helpdesk.entity.SlaPolicy;
import com.example.helpdesk.entity.Ticket;
import com.example.helpdesk.entity.TicketStatusHistory;
import com.example.helpdesk.entity.User;
import com.example.helpdesk.enums.AuthorType;
import com.example.helpdesk.enums.ChangedByType;
import com.example.helpdesk.enums.Priority;
import com.example.helpdesk.enums.TicketStatus;
import com.example.helpdesk.exception.BusinessRuleException;
import com.example.helpdesk.exception.ResourceNotFoundException;
import com.example.helpdesk.repository.AgentRepository;
import com.example.helpdesk.repository.CommentRepository;
import com.example.helpdesk.repository.SlaPolicyRepository;
import com.example.helpdesk.repository.TicketRepository;
import com.example.helpdesk.repository.TicketStatusHistoryRepository;
import com.example.helpdesk.repository.UserRepository;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;

@Service
public class TicketService {

    private static final Map<TicketStatus, TicketStatus> VALID_NEXT_STATUS = new EnumMap<>(TicketStatus.class);

    static {
        VALID_NEXT_STATUS.put(TicketStatus.OPEN, TicketStatus.IN_PROGRESS);
        VALID_NEXT_STATUS.put(TicketStatus.IN_PROGRESS, TicketStatus.RESOLVED);
        VALID_NEXT_STATUS.put(TicketStatus.RESOLVED, TicketStatus.CLOSED);
        VALID_NEXT_STATUS.put(TicketStatus.CLOSED, TicketStatus.REOPENED);
        VALID_NEXT_STATUS.put(TicketStatus.REOPENED, TicketStatus.IN_PROGRESS);
    }

    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;
    private final AgentRepository agentRepository;
    private final SlaPolicyRepository slaPolicyRepository;
    private final CommentRepository commentRepository;
    private final TicketStatusHistoryRepository ticketStatusHistoryRepository;

    public TicketService(
            TicketRepository ticketRepository,
            UserRepository userRepository,
            AgentRepository agentRepository,
            SlaPolicyRepository slaPolicyRepository,
            CommentRepository commentRepository,
            TicketStatusHistoryRepository ticketStatusHistoryRepository
    ) {
        this.ticketRepository = ticketRepository;
        this.userRepository = userRepository;
        this.agentRepository = agentRepository;
        this.slaPolicyRepository = slaPolicyRepository;
        this.commentRepository = commentRepository;
        this.ticketStatusHistoryRepository = ticketStatusHistoryRepository;
    }

    @Transactional
    public TicketResponse createTicket(CreateTicketRequest request) {
        User raisedByUser = userRepository.findById(request.raisedByUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id " + request.raisedByUserId()));

        SlaPolicy slaPolicy = slaPolicyRepository.findByPriority(request.priority())
                .orElseThrow(() -> new ResourceNotFoundException("SLA policy not found for priority " + request.priority()));

        LocalDateTime now = LocalDateTime.now();

        Ticket ticket = new Ticket();
        ticket.setTitle(request.title());
        ticket.setDescription(request.description());
        ticket.setPriority(request.priority());
        ticket.setCategory(request.category());
        ticket.setStatus(TicketStatus.OPEN);
        ticket.setRaisedByUser(raisedByUser);
        ticket.setAssignedAgent(null);
        ticket.setSlaPolicy(slaPolicy);
        ticket.setCreatedAt(now);
        ticket.setUpdatedAt(now);
        ticket.setSlaDueAt(now.plusHours(slaPolicy.getSlaHours()));

        Ticket savedTicket = ticketRepository.save(ticket);

        createStatusHistory(savedTicket, null, TicketStatus.OPEN, ChangedByType.SYSTEM, null, now);

        return toResponse(savedTicket, List.of(), ticketStatusHistoryRepository.findByTicketIdOrderByChangedAtAsc(savedTicket.getId()));
    }

    @Transactional
    public TicketResponse assignTicket(Long ticketId, AssignTicketRequest request) {
        Ticket ticket = findTicketOrThrow(ticketId);
        Agent agent = agentRepository.findById(request.agentId())
                .orElseThrow(() -> new ResourceNotFoundException("Agent not found with id " + request.agentId()));

        if (!agent.isActive()) {
            throw new BusinessRuleException("Cannot assign ticket to inactive agent");
        }

        if (ticket.getStatus() == TicketStatus.CLOSED) {
            throw new BusinessRuleException("Cannot assign a CLOSED ticket");
        }

        ticket.setAssignedAgent(agent);
        ticket.setUpdatedAt(LocalDateTime.now());

        return toResponse(ticketRepository.save(ticket));
    }

    @Transactional
    public TicketResponse updateStatus(Long ticketId, UpdateTicketStatusRequest request) {
        Ticket ticket = findTicketOrThrow(ticketId);
        validateChangedBy(request.changedByType(), request.changedById());

        TicketStatus currentStatus = ticket.getStatus();
        TicketStatus newStatus = request.newStatus();

        // This is the ticket lifecycle state machine. Every status change must pass through here.
        if (VALID_NEXT_STATUS.get(currentStatus) != newStatus) {
            throw new BusinessRuleException("Invalid status transition from " + currentStatus + " to " + newStatus);
        }

        LocalDateTime now = LocalDateTime.now();

        ticket.setStatus(newStatus);
        ticket.setUpdatedAt(now);

        if (newStatus == TicketStatus.RESOLVED) {
            ticket.setResolvedAt(now);
        } else if (newStatus == TicketStatus.CLOSED) {
            ticket.setClosedAt(now);
        } else if (newStatus == TicketStatus.REOPENED) {
            ticket.setResolvedAt(null);
            ticket.setClosedAt(null);
        }

        Ticket savedTicket = ticketRepository.save(ticket);
        createStatusHistory(savedTicket, currentStatus, newStatus, request.changedByType(), request.changedById(), now);

        return toResponse(savedTicket);
    }

    @Transactional
    public CommentResponse addComment(Long ticketId, AddCommentRequest request) {
        Ticket ticket = findTicketOrThrow(ticketId);
        validateCommentAuthor(ticket, request);

        Comment comment = new Comment();
        comment.setTicket(ticket);
        comment.setAuthorType(request.authorType());
        comment.setAuthorId(request.authorId());
        comment.setMessage(request.message());
        comment.setCreatedAt(LocalDateTime.now());

        return toCommentResponse(commentRepository.save(comment));
    }

    @Transactional(readOnly = true)
    public TicketResponse getTicketDetails(Long ticketId) {
        Ticket ticket = findTicketOrThrow(ticketId);
        return toResponse(ticket);
    }

    @Transactional(readOnly = true)
    public List<TicketResponse> searchTickets(TicketStatus status, Priority priority, String category, Long assignedAgentId) {
        Specification<Ticket> spec = (root, query, cb) -> cb.conjunction();

        if (status != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("status"), status));
        }

        if (priority != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("priority"), priority));
        }

        if (category != null && !category.isBlank()) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("category"), category));
        }

        if (assignedAgentId != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("assignedAgent").get("id"), assignedAgentId));
        }

        return ticketRepository.findAll(spec).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public AverageResolutionTimeResponse getAverageResolutionTime(Long agentId, String category) {
        if (agentId != null && !agentRepository.existsById(agentId)) {
            throw new ResourceNotFoundException("Agent not found with id " + agentId);
        }

        Double seconds = ticketRepository.findAverageResolutionSeconds(agentId, category);
        if (seconds == null) {
            seconds = 0.0;
        }

        return new AverageResolutionTimeResponse(agentId, category, seconds / 3600.0, seconds);
    }

    @Transactional(readOnly = true)
    public List<TicketResponse> getOverdueTickets() {
        return ticketRepository.findOverdueTickets(LocalDateTime.now()).stream()
                .map(this::toResponse)
                .toList();
    }

    private Ticket findTicketOrThrow(Long ticketId) {
        return ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found with id " + ticketId));
    }

    private void validateChangedBy(ChangedByType changedByType, Long changedById) {
        if (changedByType == ChangedByType.SYSTEM) {
            return;
        }

        if (changedById == null) {
            throw new BusinessRuleException("changedById is required when changedByType is " + changedByType);
        }

        if (changedByType == ChangedByType.USER && !userRepository.existsById(changedById)) {
            throw new ResourceNotFoundException("User not found with id " + changedById);
        }

        if (changedByType == ChangedByType.AGENT && !agentRepository.existsById(changedById)) {
            throw new ResourceNotFoundException("Agent not found with id " + changedById);
        }
    }

    private void validateCommentAuthor(Ticket ticket, AddCommentRequest request) {
        if (request.authorType() == AuthorType.USER) {
            if (!userRepository.existsById(request.authorId())) {
                throw new ResourceNotFoundException("User not found with id " + request.authorId());
            }

            if (!ticket.getRaisedByUser().getId().equals(request.authorId())) {
                throw new BusinessRuleException("Only the user who raised the ticket can add a user comment");
            }
            return;
        }

        if (!agentRepository.existsById(request.authorId())) {
            throw new ResourceNotFoundException("Agent not found with id " + request.authorId());
        }

        if (ticket.getAssignedAgent() == null) {
            throw new BusinessRuleException("No agent is assigned to this ticket");
        }

        if (!ticket.getAssignedAgent().getId().equals(request.authorId())) {
            throw new BusinessRuleException("Only the assigned agent can add an agent comment");
        }
    }

    private void createStatusHistory(
            Ticket ticket,
            TicketStatus fromStatus,
            TicketStatus toStatus,
            ChangedByType changedByType,
            Long changedById,
            LocalDateTime changedAt
    ) {
        TicketStatusHistory history = new TicketStatusHistory();
        history.setTicket(ticket);
        history.setFromStatus(fromStatus);
        history.setToStatus(toStatus);
        history.setChangedByType(changedByType);
        history.setChangedById(changedById);
        history.setChangedAt(changedAt);
        ticketStatusHistoryRepository.save(history);
    }

    private TicketResponse toResponse(Ticket ticket) {
        List<Comment> comments = commentRepository.findByTicketIdOrderByCreatedAtAsc(ticket.getId());
        List<TicketStatusHistory> history = ticketStatusHistoryRepository.findByTicketIdOrderByChangedAtAsc(ticket.getId());
        return toResponse(ticket, comments, history);
    }

    private TicketResponse toResponse(Ticket ticket, List<Comment> comments, List<TicketStatusHistory> history) {
        User user = ticket.getRaisedByUser();
        Agent agent = ticket.getAssignedAgent();

        UserResponse userResponse = new UserResponse(user.getId(), user.getName(), user.getEmail(), user.getCreatedAt());
        AgentResponse agentResponse = agent == null
                ? null
                : new AgentResponse(agent.getId(), agent.getName(), agent.getEmail(), agent.isActive(), agent.getCreatedAt());

        return new TicketResponse(
                ticket.getId(),
                ticket.getTitle(),
                ticket.getDescription(),
                ticket.getPriority(),
                ticket.getCategory(),
                ticket.getStatus(),
                userResponse,
                agentResponse,
                ticket.getSlaPolicy().getId(),
                ticket.getCreatedAt(),
                ticket.getUpdatedAt(),
                ticket.getSlaDueAt(),
                ticket.getResolvedAt(),
                ticket.getClosedAt(),
                comments.stream().map(this::toCommentResponse).toList(),
                history.stream().map(this::toHistoryResponse).toList()
        );
    }

    private CommentResponse toCommentResponse(Comment comment) {
        return new CommentResponse(
                comment.getId(),
                comment.getAuthorType(),
                comment.getAuthorId(),
                comment.getMessage(),
                comment.getCreatedAt()
        );
    }

    private TicketStatusHistoryResponse toHistoryResponse(TicketStatusHistory history) {
        return new TicketStatusHistoryResponse(
                history.getId(),
                history.getFromStatus(),
                history.getToStatus(),
                history.getChangedByType(),
                history.getChangedById(),
                history.getChangedAt()
        );
    }
}
