package com.example.helpdesk.controller;

import com.example.helpdesk.dto.AddCommentRequest;
import com.example.helpdesk.dto.AssignTicketRequest;
import com.example.helpdesk.dto.AverageResolutionTimeResponse;
import com.example.helpdesk.dto.CommentResponse;
import com.example.helpdesk.dto.CreateTicketRequest;
import com.example.helpdesk.dto.TicketResponse;
import com.example.helpdesk.dto.UpdateTicketStatusRequest;
import com.example.helpdesk.enums.Priority;
import com.example.helpdesk.enums.TicketStatus;
import com.example.helpdesk.service.TicketService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/tickets")
public class TicketController {

    private final TicketService ticketService;

    public TicketController(TicketService ticketService) {
        this.ticketService = ticketService;
    }

    @PostMapping
    public ResponseEntity<TicketResponse> createTicket(@Valid @RequestBody CreateTicketRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ticketService.createTicket(request));
    }

    @PostMapping("/{ticketId}/assign")
    public ResponseEntity<TicketResponse> assignTicket(
            @PathVariable Long ticketId,
            @Valid @RequestBody AssignTicketRequest request
    ) {
        return ResponseEntity.ok(ticketService.assignTicket(ticketId, request));
    }

    @PostMapping("/{ticketId}/status")
    public ResponseEntity<TicketResponse> updateTicketStatus(
            @PathVariable Long ticketId,
            @Valid @RequestBody UpdateTicketStatusRequest request
    ) {
        return ResponseEntity.ok(ticketService.updateStatus(ticketId, request));
    }

    @PostMapping("/{ticketId}/comments")
    public ResponseEntity<CommentResponse> addComment(
            @PathVariable Long ticketId,
            @Valid @RequestBody AddCommentRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ticketService.addComment(ticketId, request));
    }

    @GetMapping("/{ticketId}")
    public ResponseEntity<TicketResponse> getTicketDetails(@PathVariable Long ticketId) {
        return ResponseEntity.ok(ticketService.getTicketDetails(ticketId));
    }

    @GetMapping
    public ResponseEntity<List<TicketResponse>> searchTickets(
            @RequestParam(required = false) TicketStatus status,
            @RequestParam(required = false) Priority priority,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) Long assignedAgentId
    ) {
        return ResponseEntity.ok(ticketService.searchTickets(status, priority, category, assignedAgentId));
    }

    @GetMapping("/metrics/avg-resolution-time")
    public ResponseEntity<AverageResolutionTimeResponse> getAverageResolutionTime(
            @RequestParam(required = false) Long agentId,
            @RequestParam(required = false) String category
    ) {
        return ResponseEntity.ok(ticketService.getAverageResolutionTime(agentId, category));
    }

    @GetMapping("/overdue")
    public ResponseEntity<List<TicketResponse>> getOverdueTickets() {
        return ResponseEntity.ok(ticketService.getOverdueTickets());
    }
}
