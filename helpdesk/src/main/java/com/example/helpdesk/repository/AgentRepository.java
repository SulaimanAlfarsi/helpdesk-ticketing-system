package com.example.helpdesk.repository;

import com.example.helpdesk.entity.Agent;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AgentRepository extends JpaRepository<Agent, Long> {
    boolean existsByEmail(String email);
}
