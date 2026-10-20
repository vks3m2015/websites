package com.wellness.marketplace.config;

import com.wellness.marketplace.model.Availability;
import com.wellness.marketplace.model.ProfessionalProfile;
import com.wellness.marketplace.model.Role;
import com.wellness.marketplace.model.ServiceOffering;
import com.wellness.marketplace.model.User;

import com.wellness.marketplace.repository.AvailabilityRepository;
import com.wellness.marketplace.repository.ProfessionalRepository;
import com.wellness.marketplace.repository.ServiceRepository;
import com.wellness.marketplace.repository.UserRepository;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.math.BigDecimal;
import java.time.LocalTime;

@Configuration
public class SeedData {
    @Bean CommandLineRunner seed(UserRepository users, ProfessionalRepository ps, ServiceRepository ss,
                                 AvailabilityRepository av) {
        return args -> {
            if(users.findByEmailIgnoreCase("professional@example.com").isPresent()) return;

            BCryptPasswordEncoder enc=new BCryptPasswordEncoder();

            User pro=new User(); pro.setName("Aarav Wellness"); pro.setEmail("professional@example.com");
            pro.setPasswordHash(enc.encode("password123")); pro.setRole(Role.PROFESSIONAL); pro.setPhone("9999999999");
            users.save(pro);

            User customer=new User(); customer.setName("Demo Customer"); customer.setEmail("customer@example.com");
            customer.setPasswordHash(enc.encode("password123")); customer.setRole(Role.CUSTOMER); customer.setPhone("9888888888");
            users.save(customer);

            User admin=new User(); admin.setName("Admin"); admin.setEmail("admin@example.com");
            admin.setPasswordHash(enc.encode("password123")); admin.setRole(Role.ADMIN); users.save(admin);

            ProfessionalProfile p=new ProfessionalProfile();
            p.setUser(pro); p.setBio("Professional wellness practitioner offering appointment-based relaxation and therapeutic wellness services.");
            p.setExperienceYears(6); p.setArea("Sector 15"); p.setCity("Faridabad");
            p.setLatitude(28.4089); p.setLongitude(77.3178); p.setVerified(true);
            ps.save(p);

            ServiceOffering s1=new ServiceOffering(); s1.setProfessional(p); s1.setName("Relaxation Wellness Session");
            s1.setDescription("60-minute professional wellness session."); s1.setPrice(new BigDecimal("1200")); s1.setDurationMinutes(60); ss.save(s1);

            ServiceOffering s2=new ServiceOffering(); s2.setProfessional(p); s2.setName("Deep Tissue Wellness Session");
            s2.setDescription("60-minute targeted wellness session."); s2.setPrice(new BigDecimal("1600")); s2.setDurationMinutes(60); ss.save(s2);

            for(int day=1;day<=6;day++){
                Availability a=new Availability(); a.setProfessional(p); a.setDayOfWeek(day);
                a.setStartTime(LocalTime.of(9,0)); a.setEndTime(LocalTime.of(18,0)); av.save(a);
            }
        };
    }
}
