package com.Maathacare.Backend.util;

import com.Maathacare.Backend.model.entity.WeeklyMilestone;
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
            System.out.println("🚀 Populating MaathaCare Database with detailed 40-week data...");

            repository.deleteAll();

            repository.saveAll(Arrays.asList(
                    // --- FIRST TRIMESTER ---
                    new WeeklyMilestone(1, "Tiny Seed 🌱", "Negligible",
                            "Fertilization occurs. The zygote travels to the uterus.",
                            "Uterine lining thickens. No visible symptoms yet.",
                            "Visit PHM to begin your Pregnancy Record (Blue Book).",
                            "Start taking Folic Acid supplements daily.", "week1.mp4"),

                    new WeeklyMilestone(2, "Microscopic dot 📍", "Negligible",
                            "Implantation happens. The blastocyst settles in the uterus.",
                            "You might experience light spotting or cramping.",
                            "Confirm your pregnancy with a home test or clinic urine test.",
                            "Stay hydrated and avoid smoking/alcohol.", "week1.mp4"),

                    new WeeklyMilestone(3, "Pinhead 📍", "Negligible",
                            "The embryo's heart, brain, and spinal cord begin to form.",
                            "Missing your period. Hormones like hCG start rising.",
                            "Inform your local PHM about your positive pregnancy test.",
                            "Avoid medications unless prescribed by your doctor.", "week1.mp4"),

                    new WeeklyMilestone(4, "Poppy seed 🌑", "0.1g",
                            "Major organs begin to develop. The neural tube closes.",
                            "Breast tenderness and fatigue are very common now.",
                            "First clinical visit: PHM will record your weight and height.",
                            "Rest as much as possible; your body is working hard.", "week1.mp4"),

                    new WeeklyMilestone(5, "Orange seed 🍊", "0.2g",
                            "The heart is now beating steadily. Blood starts circulating.",
                            "Morning sickness (nausea) and food aversions may start.",
                            "PHM Checklist: Check your basic HB levels and Blood Group.",
                            "Eat small, frequent meals to combat nausea.", "week5.mp4"),

                    new WeeklyMilestone(6, "Sweet pea 🫛", "0.3g",
                            "Facial features like nostrils and ears begin to show.",
                            "Frequent urination occurs as the uterus grows.",
                            "Ensure you get your first Tetanus (TT) injection if due.",
                            "Ginger tea can help with morning sickness.", "week6.mp4"),

                    new WeeklyMilestone(7, "Blueberry 🫐", "0.5g",
                            "Arm and leg buds are growing. The brain is very active.",
                            "Mood swings are common due to high estrogen levels.",
                            "Discuss any nausea concerns with your Midwife.",
                            "Avoid high-mercury fish and raw seafood.", "week7.mp4"),

                    new WeeklyMilestone(8, "Raspberry 🍓", "1g",
                            "Fingers and toes start forming. Movement begins (unfelt).",
                            "Your skin may start to glow or develop acne.",
                            "Confirm your first ultrasound scan (dating scan) date.",
                            "Wear a supportive bra for breast comfort.", "week8.mp4"),

                    new WeeklyMilestone(9, "Green olive 🫒", "2g",
                            "Eyelids form and stay closed. The tail disappears.",
                            "Belly may start feeling a bit bloated or tight.",
                            "Clinic: Check your blood pressure and urine protein.",
                            "Increase calcium intake with milk or small fish.", "week9.mp4"),

                    new WeeklyMilestone(10, "Prune 🫐", "4g",
                            "Vital organs are functioning. Knees and ankles form.",
                            "Nausea might peak this week before getting better.",
                            "PHM Checklist: Register for the prenatal dental clinic.",
                            "Walking for 20 minutes daily is good for circulation.", "week10.mp4"),

                    new WeeklyMilestone(11, "Lime 🍋‍🟩", "7g",
                            "Baby can move their head and stretch their tiny body.",
                            "The dark line (Linea Nigra) may appear on your belly.",
                            "Check for your first trimester screening tests.",
                            "Drink at least 8-10 glasses of water daily.", "week11.mp4"),

                    new WeeklyMilestone(12, "Plum 🍑", "14g",
                            "Reflexes develop—the baby can open and close fists.",
                            "First trimester ends! Nausea usually begins to fade.",
                            "Clinic: Ensure all Blue Book blood test results are recorded.",
                            "Celebrate! The risk of miscarriage drops significantly.", "week12.mp4"),

                    // --- SECOND TRIMESTER ---
                    new WeeklyMilestone(13, "Lemon 🍋", "23g",
                            "Fingerprints have formed. The vocal cords are developing.",
                            "Energy returns! You might feel less tired than before.",
                            "Ask your PHM about safe prenatal yoga/exercise classes.",
                            "Start using moisturizer to prevent itchy skin.", "week13.mp4"),

                    new WeeklyMilestone(14, "Nectarine 🍑", "43g",
                            "The baby is covered in fine hair called lanugo.",
                            "Your appetite increases. Ensure you eat balanced meals.",
                            "Weight check: Ensure weight gain is steady but healthy.",
                            "Focus on high-protein local foods like dhal and eggs.", "week14.mp4"),

                    new WeeklyMilestone(15, "Apple 🍎", "70g",
                            "Baby's skeleton is changing from soft cartilage to bone.",
                            "Stuffy nose or 'pregnancy rhinitis' might happen.",
                            "Monitor for any signs of swelling in the feet.",
                            "Focus on good posture to avoid early back pain.", "week15.mp4"),

                    new WeeklyMilestone(16, "Avocado 🥑", "100g",
                            "Baby can hear your voice and external sounds.",
                            "You may start to feel a 'popping' feeling (the baby!).",
                            "Clinic: Get your second TT injection if required.",
                            "Talk and sing to your baby—they can hear you!", "week16.mp4"),

                    new WeeklyMilestone(17, "Pomegranate 🍎", "140g",
                            "Sweat glands are developing. Baby starts gaining fat.",
                            "Vivid dreams may occur due to deeper sleep cycles.",
                            "Keep your Blue Book updated with every clinic visit.",
                            "Sleep on your side for better placental blood flow.", "week17.mp4"),

                    new WeeklyMilestone(18, "Sweet potato 🍠", "190g",
                            "Baby can yawn, hiccup, and even make facial expressions.",
                            "Lower back pain might start as your center of gravity shifts.",
                            "PHM: Check for fetal heart sounds using the Doppler.",
                            "Consider a pregnancy pillow for better side-sleeping.", "week18.mp4"),

                    new WeeklyMilestone(19, "Mango 🥭", "240g",
                            "Vernix (a greasy coating) protects the baby's skin.",
                            "Leg cramps, especially at night, might start occurring.",
                            "Confirm the location for your Week 20 Anomaly Scan.",
                            "Eat more fiber (fruits/greens) to prevent constipation.", "week19.mp4"),

                    new WeeklyMilestone(20, "Banana 🍌", "300g",
                            "Halfway point! Baby is swallowing amniotic fluid.",
                            "You are officially halfway! Kicks are more frequent.",
                            "CRITICAL: Attend the Anomaly Scan to check organ health.",
                            "Schedule a special meal to celebrate the 20-week mark!", "week20.mp4"),

                    new WeeklyMilestone(21, "Carrot 🥕", "360g",
                            "The digestive system is maturing. Meconium is forming.",
                            "Varicose veins or stretch marks may become visible.",
                            "Continue monitoring blood pressure at every visit.",
                            "Try prenatal yoga to help with body flexibility.", "week21.mp4"),

                    new WeeklyMilestone(22, "Papaya 🥭", "430g",
                            "Inner ear is fully developed. Baby's sense of balance forms.",
                            "You may feel 'Braxton Hicks' (painless contractions).",
                            "Midwife: Check for any vaginal discharge or infections.",
                            "Play soft music; baby can now distinguish sounds.", "week22.mp4"),

                    new WeeklyMilestone(23, "Grapefruit 🍊", "500g",
                            "Lungs are developing blood vessels for future breathing.",
                            "Feet and ankles may swell slightly by the evening.",
                            "Discuss the Gestational Diabetes (OGTT) test with PHM.",
                            "Prop your feet up while sitting to reduce swelling.", "week2.mp4"),

                    new WeeklyMilestone(24, "Corn 🌽", "600g",
                            "The baby is now considered 'viable' (survivable with care).",
                            "You might feel more breathless as the uterus reaches the ribs.",
                            "Ensure your OGTT (Sugar Test) is completed this week.",
                            "Eat complex carbs like red rice for stable energy.", "week2.mp4"),

                    new WeeklyMilestone(25, "Rutabaga 🥔", "660g",
                            "Baby's skin becomes less translucent as fat builds up.",
                            "Your belly button might 'pop' out and become an 'outie'.",
                            "Ensure you are taking your Iron and Vitamin C tablets.",
                            "Keep moisturizing your belly to soothe itchy skin.", "week2.mp4"),

                    new WeeklyMilestone(26, "Scallion 🧅", "760g",
                            "The eyes begin to open. Brain activity is very intense.",
                            "Sleeping might become harder. You may feel more heat.",
                            "Clinic visit: Check fundal height to ensure baby's growth.",
                            "Relax before bed to help manage pregnancy insomnia.", "week2.mp4"),

                    // --- THIRD TRIMESTER ---
                    new WeeklyMilestone(27, "Cauliflower 🥦", "875g",
                            "Third trimester begins! Lungs can breathe air with help.",
                            "You may feel the baby's hiccups as rhythmic tapping.",
                            "Get a referral for your third-trimester blood tests.",
                            "Practice deep breathing exercises for relaxation.", "week2.mp4"),

                    new WeeklyMilestone(28, "Eggplant 🍆", "1kg",
                            "Baby is dreaming. The brain can now regulate temperature.",
                            "Backaches may increase. You may feel more tired again.",
                            "START: Daily Fetal Movement Count (DFMC) chart in Blue Book.",
                            "Record 10 kicks; contact PHM if you feel fewer than 10.", "week2.mp4"),

                    new WeeklyMilestone(29, "Acorn squash 🎃", "1.2kg",
                            "Baby's head is growing to make room for the brain.",
                            "Heartburn and indigestion may become more common.",
                            "Review your DFMC chart with your PHM at every visit.",
                            "Eat smaller meals more often to reduce heartburn.", "week2.mp4"),

                    new WeeklyMilestone(30, "Cabbage 🥬", "1.3kg",
                            "Baby is shedding lanugo hair. Bone marrow makes blood.",
                            "You might feel 'clumsy' as your joints loosen up.",
                            "Weight Check: Expect to gain about 0.5kg per week now.",
                            "Wear flat, comfortable shoes to prevent falls.", "week2.mp4"),

                    new WeeklyMilestone(31, "Coconut 🥥", "1.5kg",
                            "The senses (smell, taste, touch) are all working.",
                            "Breathing may feel shallower as baby pushes up.",
                            "Clinic: Check for baby's position (Head down/Breech).",
                            "Focus on Iron-rich foods like Gotukola and liver.", "week2.mp4"),

                    new WeeklyMilestone(32, "Jicama 🥔", "1.7kg",
                            "Baby is practicing breathing by inhaling amniotic fluid.",
                            "Nipple discharge (colostrum) might start appearing.",
                            "Midwife: Discuss your birth plan and hospital choice.",
                            "Start packing your 'Hospital Bag' for the big day.", "week2.mp4"),

                    new WeeklyMilestone(33, "Pineapple 🍍", "1.9kg",
                            "Immune system is getting stronger via your antibodies.",
                            "Pelvic pain may occur as baby's head settles lower.",
                            "Check for your final TT injection if not completed.",
                            "Rest during the day to save energy for labor.", "week2.mp4"),

                    new WeeklyMilestone(34, "Cantaloupe 🍈", "2.1kg",
                            "The central nervous system and lungs are almost mature.",
                            "You may experience more frequent Braxton Hicks.",
                            "PHM: Ensure you have all emergency contact numbers.",
                            "Learn about the signs of true labor vs false labor.", "week2.mp4"),

                    new WeeklyMilestone(35, "Honeydew melon 🍈", "2.4kg",
                            "Baby's kidneys are fully developed. Fat stores increase.",
                            "You might feel 'lightening' as baby drops into the pelvis.",
                            "Clinic: Final HB check and growth assessment.",
                            "Keep talking to your baby; they recognize your voice.", "week2.mp4"),

                    new WeeklyMilestone(36, "Romaine lettuce 🥬", "2.6kg",
                            "Baby is gaining about 30g a day. Most are head-down.",
                            "Pelvic pressure increases. Walking may feel difficult.",
                            "Ensure your Blue Book is fully completed for admission.",
                            "Finalize your birth partner and transport plan.", "week2.mp4"),

                    new WeeklyMilestone(37, "Swiss chard 🥬", "2.9kg",
                            "Baby is full term! Lungs and brain are ready for birth.",
                            "You may lose your 'mucus plug' soon. Stay alert.",
                            "Weekly clinic visits begin now until delivery.",
                            "Watch for signs of labor: contractions or water breaking.", "week2.mp4"),

                    new WeeklyMilestone(38, "Pumpkin 🎃", "3.1kg",
                            "Baby is building brain power. Reflexes are sharp.",
                            "Anxiety about birth is normal. Stay calm and positive.",
                            "Midwife: Discuss breastfeeding and early newborn care.",
                            "Rest, keep hydrated, and do gentle pelvic tilts.", "week2.mp4"),

                    new WeeklyMilestone(39, "Watermelon 🍉", "3.3kg",
                            "Baby is ready! The skin is smooth and plump.",
                            "You are likely very tired and ready to meet the baby.",
                            "Ensure you have a 24/7 plan to get to the hospital.",
                            "Walk gently to help the baby move into position.", "week2.mp4"),

                    new WeeklyMilestone(40, "Small Jakfruit 🍈", "3.5kg",
                            "Full term and ready! The big day is finally here.",
                            "True labor: Regular, painful contractions that get closer.",
                            "Contact PHM and go to the hospital if labor starts.",
                            "Trust your body. You are ready for this journey!", "week2.mp4")
            ));

            System.out.println("✅ MaathaCare Database Fully Updated with 40 Weeks!");
        } else {
            System.out.println("ℹ️ Database already contains data.");
        }
    }
}