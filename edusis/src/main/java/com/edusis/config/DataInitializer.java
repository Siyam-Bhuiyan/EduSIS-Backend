package com.edusis.config;

import com.edusis.enums.Role;
import com.edusis.model.User;
import com.edusis.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Override
    public void run(String... args) throws Exception {
        // Create test users if they don't exist
        if (userRepository.count() == 0) {
            // Create Admin user
            User admin = new User("admin", "admin123", "System Administrator", "admin@edusis.com", Role.ADMIN);
            userRepository.save(admin);

            // Create Teacher user
            User teacher = new User("teacher", "teacher123", "Dr. John Smith", "teacher@edusis.com", Role.TEACHER);
            userRepository.save(teacher);

            // Create Student user
            User student = new User("student", "student123", "Jane Doe", "student@edusis.com", Role.STUDENT);
            userRepository.save(student);

            System.out.println("✅ Test users created successfully!");
            System.out.println("👤 Admin - username: admin, password: admin123");
            System.out.println("👨‍🏫 Teacher - username: teacher, password: teacher123");
            System.out.println("👨‍🎓 Student - username: student, password: student123");
        }
    }
}
