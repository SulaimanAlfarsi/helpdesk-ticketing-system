package com.example.helpdesk.repository;

import com.example.helpdesk.entity.SlaPolicy;
import com.example.helpdesk.enums.Priority;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SlaPolicyRepository extends JpaRepository<SlaPolicy, Long> {
    Optional<SlaPolicy> findByPriority(Priority priority);
}
