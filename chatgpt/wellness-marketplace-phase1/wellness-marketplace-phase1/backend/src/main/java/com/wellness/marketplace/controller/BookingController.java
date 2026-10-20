package com.wellness.marketplace.controller;

import com.wellness.marketplace.model.*;
import com.wellness.marketplace.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import java.time.*;
import java.util.List;

@RestController @RequestMapping("/bookings") @RequiredArgsConstructor
public class BookingController {
    private final BookingRepository bookings;
    private final UserRepository users;
    private final ProfessionalRepository professionals;
    private final ServiceRepository services;

    public record CreateBooking(Long professionalId,Long serviceId,String startTime){}
    public record BookingDto(Long id,String professional,String service,String startTime,String endTime,String price,String status){}

    private BookingDto dto(Booking b) {
        return new BookingDto(b.getId(),b.getProfessional().getUser().getName(),b.getService().getName(),
            b.getStartTime().toString(),b.getEndTime().toString(),b.getPrice().toString(),b.getStatus().name());
    }

    @PostMapping @Transactional
    public ResponseEntity<?> create(@RequestBody CreateBooking r, java.security.Principal principal) {
        Long userId=Long.valueOf(principal.getName());
        User customer=users.findById(userId).orElseThrow();
        ProfessionalProfile p=professionals.findById(r.professionalId()).orElseThrow();
        ServiceOffering s=services.findById(r.serviceId()).orElseThrow();
        if(!s.getProfessional().getId().equals(p.getId())) return ResponseEntity.badRequest().body("Service does not belong to professional");

        LocalDateTime start=LocalDateTime.parse(r.startTime());
        LocalDateTime end=start.plusMinutes(s.getDurationMinutes());

        if(start.isBefore(LocalDateTime.now())) return ResponseEntity.badRequest().body("Appointment must be in the future");
        if(bookings.overlapping(p.getId(),start,end)>0)
            return ResponseEntity.status(HttpStatus.CONFLICT).body("The selected slot is no longer available.");

        Booking b=new Booking();
        b.setCustomer(customer); b.setProfessional(p); b.setService(s);
        b.setStartTime(start); b.setEndTime(end); b.setPrice(s.getPrice()); b.setStatus(BookingStatus.CONFIRMED);
        return ResponseEntity.ok(dto(bookings.save(b)));
    }

    @GetMapping("/mine")
    public List<BookingDto> mine(java.security.Principal principal) {
        return bookings.findByCustomerIdOrderByStartTimeDesc(Long.valueOf(principal.getName())).stream().map(this::dto).toList();
    }

    @GetMapping("/professional")
    public List<BookingDto> professional(java.security.Principal principal) {
        return bookings.findByProfessionalUserIdOrderByStartTimeDesc(Long.valueOf(principal.getName())).stream().map(this::dto).toList();
    }
}
