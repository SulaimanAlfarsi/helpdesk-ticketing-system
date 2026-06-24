package com.example.helpdesk.service;

import com.example.helpdesk.dto.AgentResponse;
import com.example.helpdesk.dto.CreateAgentRequest;
import com.example.helpdesk.entity.Agent;
import com.example.helpdesk.exception.BusinessRuleException;
import com.example.helpdesk.repository.AgentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class AgentService {

    private final AgentRepository agentRepository;

    public AgentService(AgentRepository agentRepository) {
        this.agentRepository = agentRepository;
    }

    @Transactional
    public AgentResponse createAgent(CreateAgentRequest request) {
        if (agentRepository.existsByEmail(request.email())) {
            throw new BusinessRuleException("Agent email already exists");
        }

        Agent agent = new Agent();
        agent.setName(request.name());
        agent.setEmail(request.email());
        agent.setActive(request.active());
        agent.setCreatedAt(LocalDateTime.now());

        return toResponse(agentRepository.save(agent));
    }
    @Transactional(readOnly = true)
    public List<AgentResponse> getAllAgents() {
        return agentRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public AgentResponse toResponse(Agent agent) {
        return new AgentResponse(agent.getId(), agent.getName(), agent.getEmail(), agent.isActive(), agent.getCreatedAt());
    }
}
