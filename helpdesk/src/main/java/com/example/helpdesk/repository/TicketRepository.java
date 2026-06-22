package com.example.helpdesk.repository;

import com.example.helpdesk.entity.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface TicketRepository extends JpaRepository<Ticket, Long>, JpaSpecificationExecutor<Ticket> {

    @Query(value = """
            SELECT COALESCE(AVG(EXTRACT(EPOCH FROM (t.resolved_at - t.created_at))), 0)
            FROM tickets t
            WHERE t.resolved_at IS NOT NULL
              AND (:agentId IS NULL OR t.assigned_agent_id = :agentId)
              AND (:category IS NULL OR t.category = :category)
            """, nativeQuery = true)
    Double findAverageResolutionSeconds(@Param("agentId") Long agentId, @Param("category") String category);

    @Query("""
            SELECT t FROM Ticket t
            WHERE t.status NOT IN (com.example.helpdesk.enums.TicketStatus.RESOLVED, com.example.helpdesk.enums.TicketStatus.CLOSED)
              AND t.slaDueAt < :now
            ORDER BY t.slaDueAt ASC
            """)
    List<Ticket> findOverdueTickets(@Param("now") LocalDateTime now);
}
