package com.wellness.marketplace.controller;

import com.wellness.marketplace.model.*;
import com.wellness.marketplace.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.util.*;

@RestController @RequestMapping("/professionals") @RequiredArgsConstructor
public class ProfessionalController {
    private final ProfessionalRepository professionals;
    private final ServiceRepository services;
    private final AvailabilityRepository availability;

    public record ProfessionalDto(Long id,String name,String area,String city,String bio,int experienceYears,
                                  boolean verified,Double latitude,Double longitude,List<ServiceDto> services){}
    public record ServiceDto(Long id,String name,String description,BigDecimal price,int durationMinutes){}
    public record AvailabilityDto(Long id,int dayOfWeek,String startTime,String endTime){}

    private ProfessionalDto dto(ProfessionalProfile p){
        var ss=services.findByProfessionalIdAndActiveTrue(p.getId()).stream()
            .map(s->new ServiceDto(s.getId(),s.getName(),s.getDescription(),s.getPrice(),s.getDurationMinutes())).toList();
        return new ProfessionalDto(p.getId(),p.getUser().getName(),p.getArea(),p.getCity(),p.getBio(),p.getExperienceYears(),
            p.isVerified(),p.getLatitude(),p.getLongitude(),ss);
    }

    @GetMapping public List<ProfessionalDto> search(
        @RequestParam(required=false) Double lat,@RequestParam(required=false) Double lon,
        @RequestParam(defaultValue="10") double radiusKm,@RequestParam(required=false) String service) {
        return professionals.nearby(lat,lon,radiusKm*1000,service,50).stream().map(this::dto).toList();
    }

    @GetMapping("/{id}") public ProfessionalDto get(@PathVariable Long id) {
        return dto(professionals.findById(id).orElseThrow());
    }

    @GetMapping("/{id}/availability")
    public List<AvailabilityDto> availability(@PathVariable Long id) {
        return availability.findByProfessionalIdOrderByDayOfWeekAscStartTimeAsc(id).stream()
            .map(a->new AvailabilityDto(a.getId(),a.getDayOfWeek(),a.getStartTime().toString(),a.getEndTime().toString())).toList();
    }
}
