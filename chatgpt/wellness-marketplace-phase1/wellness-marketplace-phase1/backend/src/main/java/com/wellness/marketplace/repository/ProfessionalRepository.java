package com.wellness.marketplace.repository;
import com.wellness.marketplace.model.ProfessionalProfile;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import java.util.*;
public interface ProfessionalRepository extends JpaRepository<ProfessionalProfile,Long> {
    Optional<ProfessionalProfile> findByUserId(Long userId);

    @Query(value = """
        SELECT p.* FROM professional_profiles p
        WHERE p.verified = true
        AND (:service IS NULL OR EXISTS (
          SELECT 1 FROM service_offerings s
          WHERE s.professional_id=p.id AND s.active=true AND lower(s.name) like lower(concat('%', :service, '%'))
        ))
        AND (
          :lat IS NULL OR :lon IS NULL OR
          ST_DWithin(
            ST_SetSRID(ST_MakePoint(p.longitude,p.latitude),4326)::geography,
            ST_SetSRID(ST_MakePoint(:lon,:lat),4326)::geography,
            :radiusMeters
          )
        )
        ORDER BY
          CASE WHEN :lat IS NULL OR :lon IS NULL THEN 0
          ELSE ST_Distance(
            ST_SetSRID(ST_MakePoint(p.longitude,p.latitude),4326)::geography,
            ST_SetSRID(ST_MakePoint(:lon,:lat),4326)::geography
          ) END
        LIMIT :limit
        """, nativeQuery=true)
    List<ProfessionalProfile> nearby(@Param("lat") Double lat, @Param("lon") Double lon,
                                      @Param("radiusMeters") double radiusMeters,
                                      @Param("service") String service, @Param("limit") int limit);
}
