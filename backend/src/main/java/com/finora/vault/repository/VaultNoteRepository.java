package com.finora.vault.repository;

import com.finora.vault.model.VaultNote;
import com.finora.vault.model.VaultTag;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VaultNoteRepository extends JpaRepository<VaultNote, String> {

    List<VaultNote> findByVaultProfileIdAndDeletedAtIsNullOrderByUpdatedAtDesc(String vaultProfileId);

    List<VaultNote> findByVaultProfileIdAndTagAndDeletedAtIsNullOrderByUpdatedAtDesc(String vaultProfileId, VaultTag tag);

    @Query("SELECT n FROM VaultNote n WHERE n.vaultProfileId = :vaultProfileId AND n.deletedAt IS NULL AND " +
           "(LOWER(n.label) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "(n.description IS NOT NULL AND LOWER(n.description) LIKE LOWER(CONCAT('%', :query, '%')))) " +
           "ORDER BY n.updatedAt DESC")
    List<VaultNote> searchNotes(@Param("vaultProfileId") String vaultProfileId, @Param("query") String query);
}
