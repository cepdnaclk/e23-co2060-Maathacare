package com.Maathacare.Backend.util;

import com.Maathacare.Backend.entity.WeeklyMilestone;
import com.Maathacare.Backend.repository.WeeklyMilestoneRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import java.util.Arrays;

@Component
public class MilestoneDataLoader implements CommandLineRunner {

    private final WeeklyMilestoneRepository repository;

    public MilestoneDataLoader(WeeklyMilestoneRepository repository) {
        this.repository = repository;
    }

    @Override
    public void run(String... args) throws Exception {
        if (repository.count() < 40) {
            System.out.println("Starting to populate MaathaCare Database with 40 weeks...");

            repository.saveAll(Arrays.asList(
                    new WeeklyMilestone(1, "Tiny Seed 🌱", "Negligible", "Start taking prenatal vitamins with folic acid."),
                    new WeeklyMilestone(2, "Microscopic dot 📍", "Negligible", "Monitor your ovulation cycle and stay hydrated."),
                    new WeeklyMilestone(3, "Pinhead 📍", "Negligible", "Avoid alcohol and smoking as the baby begins to form."),
                    new WeeklyMilestone(4, "Poppy seed 🌑", "0.1g", "Your baby is an embryo! Rest as much as possible."),
                    new WeeklyMilestone(5, "Orange seed 🍊", "0.2g", "Heart is starting to beat. Eat small, frequent meals."),
                    new WeeklyMilestone(6, "Sweet pea 🫛", "0.3g", "Morning sickness may start. Ginger tea can help."),
                    new WeeklyMilestone(7, "Blueberry 🫐", "0.5g", "The brain is developing rapidly. Avoid high-mercury fish."),
                    new WeeklyMilestone(8, "Raspberry 🍓", "1g", "Fingers and toes are forming. Book your first scan."),
                    new WeeklyMilestone(9, "Green olive 🫒", "2g", "Your baby is moving! Keep up your calcium intake."),
                    new WeeklyMilestone(10, "Prune 🫐", "4g", "Vital organs are functional. Stay active with walking."),
                    new WeeklyMilestone(11, "Lime 🍋‍🟩", "7g", "Facial features are becoming distinct. Drink more water."),
                    new WeeklyMilestone(12, "Plum 🍑", "14g", "First trimester ends! Your risk of miscarriage drops."),
                    new WeeklyMilestone(13, "Lemon 🍋", "23g", "Baby has fingerprints. Start a pregnancy journal."),
                    new WeeklyMilestone(14, "Nectarine 🍑", "43g", "Your baby is now the size of a nectarine! They are constantly moving."),
                    new WeeklyMilestone(15, "Apple 🍎", "70g", "Baby is sensitive to light. Focus on good posture."),
                    new WeeklyMilestone(16, "Avocado 🥑", "100g", "Baby can hear your voice. Talk to your bump!"),
                    new WeeklyMilestone(17, "Pomegranate 🍎", "140g", "Sweat glands are developing. Sleep on your side."),
                    new WeeklyMilestone(18, "Sweet potato 🍠", "190g", "Baby is yawning and hiccuping. Buy a pregnancy pillow."),
                    new WeeklyMilestone(19, "Mango 🥭", "240g", "A protective coating forms on baby skin. Eat fiber."),
                    new WeeklyMilestone(20, "Banana 🍌", "300g", "Halfway there! Schedule your anomaly scan."),
                    new WeeklyMilestone(21, "Carrot 🥕", "360g", "Baby is swallowing amniotic fluid. Try prenatal yoga."),
                    new WeeklyMilestone(22, "Papaya 🥭", "430g", "Inner ear is developed. Play some soft music."),
                    new WeeklyMilestone(23, "Grapefruit 🍊", "500g", "Baby looks like a miniature newborn. Stay hydrated."),
                    new WeeklyMilestone(24, "Corn 🌽", "600g", "Lungs are beginning to develop. Monitor blood sugar."),
                    new WeeklyMilestone(25, "Rutabaga 🥔", "660g", "Baby has hair! Keep moisturizing your belly."),
                    new WeeklyMilestone(26, "Scallion 🧅", "760g", "Baby can open and shut their eyes. Relax more."),
                    new WeeklyMilestone(27, "Cauliflower 🥦", "875g", "Third trimester begins! Practice breathing exercises."),
                    new WeeklyMilestone(28, "Eggplant 🍆", "1kg", "Baby is dreaming. Start counting baby kicks."),
                    new WeeklyMilestone(29, "Acorn squash 🎃", "1.2kg", "Baby brain is very active. Eat Omega-3 rich foods."),
                    new WeeklyMilestone(30, "Cabbage 🥬", "1.3kg", "Baby is regulating their own temperature. Stay cool."),
                    new WeeklyMilestone(31, "Coconut 🥥", "1.5kg", "Baby is going through a growth spurt. Eat protein."),
                    new WeeklyMilestone(32, "Jicama 🥔", "1.7kg", "Baby is practicing breathing. Pack your hospital bag."),
                    new WeeklyMilestone(33, "Pineapple 🍍", "1.9kg", "Baby immune system is developing. Rest as needed."),
                    new WeeklyMilestone(34, "Cantaloupe 🍈", "2.1kg", "Baby is settling into position. Sleep is key."),
                    new WeeklyMilestone(35, "Honeydew melon 🍈", "2.4kg", "Hearing is fully developed. Keep talking to baby."),
                    new WeeklyMilestone(36, "Romaine lettuce 🥬", "2.6kg", "Baby is gaining 1oz a day. Finalize birth plans."),
                    new WeeklyMilestone(37, "Swiss chard 🥬", "2.9kg", "Baby is full term! Watch for signs of labor."),
                    new WeeklyMilestone(38, "Pumpkin 🎃", "3.1kg", "Baby is building brain power. Keep calm and rest."),
                    new WeeklyMilestone(39, "Watermelon 🍉", "3.3kg", "Baby is ready to meet you! Walk gently to help."),
                    new WeeklyMilestone(40, "Small Pumpkin 🎃", "3.5kg", "The big day is here! Trust your body and breath.")
            ));

            System.out.println("MaathaCare Database Fully Populated with 40 Weeks!");
        } else {
            System.out.println("Database already contains milestone data.");
        }
    }
}