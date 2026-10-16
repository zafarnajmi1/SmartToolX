export type PregnancyWeek = {
  week: number;
  size: string;
  baby: string;
  you: string;
};

export type Gestation = {
  days: number;
  weeksComplete: number;
  weekDays: number;
  weekNumber: number;
  month: number;
  trimester: "First" | "Second" | "Third";
  due: string;
  remaining: number;
  overdue: boolean;
};

/** Gestational month 1–9 from pregnancy week (LMP dating). */
export function pregnancyMonthFromWeek(week: number) {
  const w = Math.min(40, Math.max(1, week));
  if (w <= 4) return 1;
  if (w <= 8) return 2;
  if (w <= 13) return 3;
  if (w <= 17) return 4;
  if (w <= 21) return 5;
  if (w <= 27) return 6;
  if (w <= 31) return 7;
  if (w <= 35) return 8;
  return 9;
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export function localISODate(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function startOfLocalDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/** Naegele: pregnancy dating from LMP. Week 1 is days 0–6. Due date is day 280 (40w 0d). */
export function gestationFromLmp(lmp: string, now = new Date()): Gestation | null {
  if (!lmp) return null;
  const start = new Date(`${lmp}T00:00:00`);
  if (Number.isNaN(start.getTime())) return null;
  const lmpDay = startOfLocalDay(start);
  const today = startOfLocalDay(now);
  if (lmpDay.getTime() > today.getTime()) return null;
  const days = Math.round((today.getTime() - lmpDay.getTime()) / 86_400_000);
  if (days > 320) return null;
  const dueDate = new Date(lmpDay);
  dueDate.setDate(dueDate.getDate() + 280);
  const weeksComplete = Math.floor(days / 7);
  const weekDays = days % 7;
  const weekNumber = Math.min(40, Math.max(1, weeksComplete || 1));
  const month = pregnancyMonthFromWeek(weekNumber);
  const trimester: Gestation["trimester"] =
    weekNumber <= 13 ? "First" : weekNumber <= 27 ? "Second" : "Third";
  return {
    days,
    weeksComplete,
    weekDays,
    weekNumber,
    month,
    trimester,
    due: localISODate(dueDate),
    remaining: 280 - days,
    overdue: days > 280,
  };
}

export const PREGNANCY_WEEKS: PregnancyWeek[] = [
  {
    week: 1,
    size: "Not yet an embryo",
    baby: "There is no baby yet. Pregnancy weeks are counted from the first day of your last period, so week 1 is still your period week. The uterus lining is shedding, then it starts to build a fresh, soft lining that could later hold a pregnancy. An egg is still ripening in the ovary. Conception has not happened.",
    you: "This week feels like a normal period for most people. Write down the first day you bled. That date is how this calculator counts weeks and the due date. Eat as you usually do, drink water, and start a prenatal vitamin with folic acid if your clinician already suggested one. You do not need a pregnancy test yet.",
  },
  {
    week: 2,
    size: "Egg not fertilized yet",
    baby: "There is still no embryo. Hormone signals tell one ovary to finish ripening an egg. In a typical 28-day cycle the egg is released near the end of this week. That release is ovulation. The egg can live about a day. Sperm that are already in the tube can wait for it. Fertilization has not happened yet.",
    you: "Some people notice stretchy clear discharge, a brief one-sided twinge, or a higher sex drive around ovulation. Those signs are not a guarantee. Fertile days often sit in this window. If you are trying to conceive, this is the usual time. Keep tracking the first day of your last period so later dates stay consistent.",
  },
  {
    week: 3,
    size: "A single cell, then a cluster",
    baby: "If sperm meets the egg, they join this week. That one cell is a zygote. It then splits again and again into a tiny cluster. The cluster travels down the tube toward the uterus. It is still thinner than a grain of salt. Nothing looks like a baby yet. Many clusters never implant, and that is common.",
    you: "You will not feel pregnant yet. A home test is still too early for most people because pregnancy hormone has not risen enough. You may feel like your usual self. Avoid alcohol, smoking, and extra vitamin A from supplements if you might be pregnant. Call a clinician for severe one-sided pain, which needs a prompt check.",
  },
  {
    week: 4,
    size: "About 2 mm",
    baby: "The cluster may settle into the uterus lining. That step is implantation. After it succeeds, cells start making pregnancy hormone (hCG). One group of cells will become the embryo. Another group will become the placenta, which later feeds the baby. The cluster is still about the size of a poppy seed.",
    you: "A missed period is often the first clue. A home test may turn positive near the end of this week. Some people see a little pink or brown spotting for a day or two when the cluster implants. That spotting should stay light and short. Heavy bleeding, clots, or strong pain need a same-day call to your clinician.",
  },
  {
    week: 5,
    size: "About 3 mm",
    baby: "The cluster is now an embryo. A flat strip called the neural tube begins to close. It will become the brain and spinal cord. A simple heart tube starts to pulse. There are no arms or legs yet. This is still an embryo, not a fetus. Size is around a sesame seed. Every day of this week matters for early organ maps.",
    you: "Tender breasts, tiredness, more bathroom trips, or a little nausea can start. Smell can feel stronger. Take a prenatal vitamin with folic acid unless your clinician said otherwise. Eat small meals if your stomach is off. Call for heavy bleeding, fainting, or pain on one side. Confirm the pregnancy with a test and book prenatal care.",
  },
  {
    week: 6,
    size: "About 5 mm",
    baby: "Tiny limb buds poke out where arms and legs will grow. The face plate starts. Early brain spaces form. The heart tube is beating and is often seen on an early scan. Dark spots mark where eyes will be. The embryo is curved, about the size of a lentil. Organs are only sketches, not finished parts.",
    you: "Nausea and food smells can hit hard. Dry crackers, small frequent meals, and sipping water help some people. Rest when you can. Ginger tea is a common home step, but ask your clinician before any herb or medicine. Heavy bleeding, shoulder pain, or severe cramps need urgent care. You may still have no bump.",
  },
  {
    week: 7,
    size: "About 1 cm",
    baby: "Arm and leg buds get longer. Paddle-like hands and feet appear. The brain is growing fast and the head looks large next to the body. Kidneys, liver, and gut are mapping out in simple form. Nostril pits and ear folds start. The embryo is about the size of a blueberry and still fully curled.",
    you: "You may need more sleep than usual. A metallic taste, extra saliva, or food aversions are typical now. Constipation can start because progesterone slows the gut. Drink water and add fiber if it agrees with you. Mood can swing. Tell your clinician about vomiting that keeps food or water down poorly.",
  },
  {
    week: 8,
    size: "About 1.6 cm",
    baby: "Fingers and toes begin to separate from the paddles. The tail-like end shrinks. Elbows and wrists start to show. The heart has more chambers. Ears and eyes keep forming. The embryo is about a raspberry, tiny and curled inside a fluid sac. Movement can happen, but you cannot feel it.",
    you: "Clothes may feel snug at the waist even if no bump shows. Bloating is common. Keep water nearby if you feel queasy. Wear a softer waistband. Avoid saunas, hot tubs, and overheating. If you have not booked a first prenatal visit, do that now. Report fever, painful urination, or bleeding.",
  },
  {
    week: 9,
    size: "About 2.3 cm",
    baby: "The main organs are in place and will keep maturing for months. The head is still large compared with the body. Tiny muscles twitch. The heart is beating in a steady pattern. Eyelids form but stay closed. The embryo is about a cherry. Teeth buds sit in the gums. The placenta is taking over more of the hormone work.",
    you: "Mood swings can follow hormone changes. You may cry easily or feel extra anxious. That can still be normal, but tell someone if you cannot cope. Light spotting should still be checked if it worries you. Continue prenatal vitamins. Cut back on caffeine if your clinician asked you to. Rest without guilt.",
  },
  {
    week: 10,
    size: "About 3 cm",
    baby: "This is the usual switch from embryo to fetus. Bones begin to harden from soft cartilage. Kidneys make a little urine that goes into the amniotic fluid. Fingers and toes are separate. The stomach makes digestive juices. The fetus is about a strawberry. Vital organs will keep growing, not starting from zero.",
    you: "A first prenatal visit often happens around now. Blood pressure, a dating scan, blood tests, and a urine check may be offered. Write questions before you go. Nausea may still be strong. Ask about safe options if you cannot keep meals down. Share any past pregnancy problems, medicines, and health conditions.",
  },
  {
    week: 11,
    size: "About 4 cm",
    baby: "Fingernails start as thin plates. The fetus can hiccup, though you will not feel it. External genitals are forming but a scan often cannot tell sex yet. Hair follicles appear in the skin. The fetus is about a fig. Arms and legs can bend. The diaphragm is practicing tiny moves that later become breathing motions.",
    you: "Energy can still be low. Constipation is common. Walk a little if you feel up to it, and drink water. You may notice more vaginal discharge that is thin and pale. That can be normal. Itching, smell, or pain needs a check. Tell your clinician about headaches that will not ease, or vision changes.",
  },
  {
    week: 12,
    size: "About 5.4 cm",
    baby: "Reflexes are forming, so the fetus may curl fingers or wriggle if touched on a scan. The intestines move from the cord into the abdomen. Vocal cords are present, but there is no air and no cry yet. Kidneys, liver, and brain keep growing. Size is about a lime. The face looks more human, still with a large head.",
    you: "Nausea often eases for many people after this week, but not for everyone. The uterus is rising toward the pelvis brim. You may still hide the pregnancy in loose clothes. The chance of miscarriage drops compared with earlier weeks, but warning signs still matter. Report bleeding, fluid leaks, or strong pain.",
  },
  {
    week: 13,
    size: "About 7 cm",
    baby: "The first trimester ends this week. Unique fingerprint patterns start on the fingertips. The fetus swallows amniotic fluid, which helps the gut practice. Vocal cords and vocal box keep forming. Bones are hardening. Size is about a peach. The placenta is the main food and oxygen supply through the cord.",
    you: "A small bump may show on a lean frame. Energy can return a little. You may feel hungrier. Eat regular meals with protein, fruit, vegetables, and water. Report sharp one-sided pain, dizziness, or fainting promptly. If your clinic offered first-trimester screening, ask what the results mean in plain words.",
  },
  {
    week: 14,
    size: "About 8.5 cm",
    baby: "Fine hair called lanugo can cover the skin. It helps hold a creamy coating later. The neck is more defined, so the chin is not tucked as tightly. The liver starts making bile. The spleen helps with blood cells. The fetus can squint, frown, and grip. Size is about a lemon. Red blood cells form in larger numbers.",
    you: "Second trimester often feels steadier. Appetite may return. Continue prenatal care on the schedule you were given. You might notice a thicker white discharge. That can be normal if there is no itch or smell. Round-ligament twinges can start as the uterus grows. Slow down when you stand up fast.",
  },
  {
    week: 15,
    size: "About 10 cm",
    baby: "Bones are getting harder. Legs are growing longer than arms. The fetus can move freely in the fluid and may suck a thumb. Taste buds are forming. Ears are moving toward their usual place. Size is about an apple. The skin is still thin and you could see blood vessels on a detailed scan.",
    you: "You might feel extra saliva or a stuffy nose. A supportive bra can help as breasts get heavier. You may still not feel movement. That is common, especially in a first pregnancy. Gentle activity that your clinician approved is useful. Avoid lying flat on your back for long workouts if it makes you dizzy.",
  },
  {
    week: 16,
    size: "About 12 cm",
    baby: "Face muscles work, so expressions can change on a scan. The heart is pumping blood through the placenta and back. The nervous system is sending more signals. The fetus can hear some low sounds as the inner ear matures. Size is about an avocado. Eyes face forward more. The neck is longer.",
    you: "Some people feel the first flutters (quickening), especially if this is not a first pregnancy. It can feel like bubbles or a light tickle. Do not worry if you feel nothing yet. You may get nosebleeds or bleeding gums. Use a soft toothbrush. Tell your clinician about severe headaches or swelling of the face.",
  },
  {
    week: 17,
    size: "About 13 cm",
    baby: "Brown fat stores begin. After birth this fat helps the baby stay warm. The skeleton is turning from cartilage to bone, but bones stay somewhat flexible. Sweat glands form. The fetus is about a turnip. The cord is thicker and carries more blood. Lungs are growing branches, still not ready for air.",
    you: "Round-ligament twinges on the sides of the bump can feel like brief pulls when you stand or turn. Move slowly. A short rest usually eases them. Your center of gravity is shifting, so watch steps and wet floors. Eat iron-rich foods if your clinician said your iron is low. Keep taking your prenatal vitamin.",
  },
  {
    week: 18,
    size: "About 14 cm",
    baby: "Ears sit in a more typical place on the head. Myelin starts to coat nerves so signals travel better. The fetus yawns and hiccups. Sex organs are clearer on many scans now, though not always. Size is about a bell pepper. The baby can swallow and the kidneys keep making urine that refreshes the fluid.",
    you: "You may notice a darker line on the abdomen (linea nigra) or patches on the face. They usually fade after birth. Use sunscreen. A scan around the next weeks may be booked to look at organs. Wear comfortable shoes. Dizziness when you stand needs a pause, water, and a mention at your next visit if it repeats.",
  },
  {
    week: 19,
    size: "About 15 cm",
    baby: "A creamy coating called vernix starts to protect the skin in the fluid. Senses keep developing: touch, hearing, and balance. Hair on the scalp may appear. The fetus is about a mango. Arms and legs have proportions closer to a newborn, still with a large head. The placenta is growing to match the baby’s needs.",
    you: "Back strain is common as the uterus grows. Side sleeping with a pillow between the knees helps some people. A small pillow under the bump can help too. You may feel more kicks. If movement is new, learn the usual pattern over the coming weeks. Call for bleeding, fluid leaking, or pain that does not settle.",
  },
  {
    week: 20,
    size: "About 16.5 cm crown to rump",
    baby: "You are about halfway. An anatomy scan is often offered around this week. It reviews the brain, heart, spine, kidneys, limbs, and where the placenta sits. The fetus swallows, kicks, and can have hiccups you might feel as rhythmic taps. Skin is still thin. Size from head to bottom is about a banana.",
    you: "The bump is usually obvious. Practice pelvic-floor squeezes if your clinician recommends them. Heartburn and constipation can increase. Eat smaller meals. You may feel the baby more in the evenings. Ask at the scan what they are checking. Report reduced movement, severe headache, or sudden swelling of hands or face.",
  },
  {
    week: 21,
    size: "About 27 cm crown to heel",
    baby: "Length is now often measured from head to heel. Bone marrow starts to make more blood cells. The fetus is about a carrot. Eyebrows and lids are clearer. The digestive system is practicing, though the baby still gets food from the placenta. Movements get stronger as muscles grow.",
    you: "You may feel stronger kicks, rolls, and stretches. Start noticing a daily pattern, even if formal kick counts come later. Stretch marks can appear on the bump, hips, or breasts. They are common. Drink water and change position if your feet swell by evening. Sudden swelling of the face or hands should be checked.",
  },
  {
    week: 22,
    size: "About 28 cm",
    baby: "Eyelids and eyebrows are formed. The pancreas is making hormones, including insulin. Taste buds are present, so flavors from your food can reach the fluid. The fetus is about a papaya. Fingernails are more complete. The brain is adding simple folds. Lungs have more tiny sacs, still too early for easy breathing after birth.",
    you: "Swelling in feet at the end of the day is common in heat or after standing. Rest with your feet up. Sudden face or hand swelling, a severe headache, or spots in your vision need same-day care. You may feel Braxton Hicks: the uterus firms then softens. They should not get longer, stronger, and closer together.",
  },
  {
    week: 23,
    size: "About 29 cm",
    baby: "The skin is still thin and reddish. Hearing is developing. Loud sounds can cause a startle on a scan. The fetus is about a large mango. Hands can find the face. The inner ear helps with balance in the fluid. Fat is still low, so the baby looks a bit wrinkled. Rapid brain growth continues every day.",
    you: "Braxton Hicks tightenings can start. Time them if they come often. They should fade with water, rest, or a change of position. Regular, strengthening tightenings with back pain need a call. You may feel clumsy. Wear stable shoes. Talk to your clinician before any new exercise class or long travel.",
  },
  {
    week: 24,
    size: "About 30 cm",
    baby: "Lung cells start making surfactant. That substance later helps air sacs stay open after birth. Survival after a very early birth can improve with specialist hospital care, but this is still a preterm stage. The fetus is about an ear of corn. The face is fuller. Unique footprints are set.",
    you: "Glucose screening is often offered in the next weeks to check for pregnancy diabetes. Eat as your clinic advised before the test. Report reduced movement, fever, leaking fluid, or bleeding. Your balance changes more now. Sleep on your side if lying on your back makes you breathless or dizzy.",
  },
  {
    week: 25,
    size: "About 34 cm",
    baby: "Nostrils begin to open. The spine is getting stronger. Hands can grip the cord. The fetus is about a cauliflower. Hair on the head may be visible on a detailed scan. Blood vessels in the lungs grow. The baby still cannot breathe air, but chest moves continue as practice. Skin is a bit less transparent as fat is added.",
    you: "Heartburn can increase as the uterus presses the stomach. Smaller meals and not lying down right after eating may help. Sleep with your upper body a little raised if burning is worse at night. Hemorrhoids can appear. Mention them at your visit. Call for chest pain, fainting, or vomiting blood.",
  },
  {
    week: 26,
    size: "About 35 cm",
    baby: "Eyes can open and close. Inhaling and exhaling amniotic fluid is practice for breathing. Immune cells are developing. The fetus is about a bunch of spring onions. Eyelashes grow. The baby can respond to light and noise. Lungs and brain still have a lot of work before a full-term birth.",
    you: "Sleep can be broken by bathroom trips, heartburn, or kicks. A left-side position is often suggested in later pregnancy if it is comfortable. Use pillows to support the bump and back. Rest during the day if nights are poor. Tell your clinician about snoring with gasping, or headaches on waking.",
  },
  {
    week: 27,
    size: "About 36 cm",
    baby: "The second trimester ends. Brain tissue is growing fast and more folds appear. Regular sleep-wake cycles may show on a scan. The fetus is about a head of lettuce. Lungs grow more branches. The baby can suck and swallow in a more coordinated way. Fat is filling out the arms and legs a little.",
    you: "Restless legs or calf cramps at night are common. Stretch the calf gently and drink water. Mention persistent pain or swelling in one leg, which needs a check. You may feel more tired again as the third trimester nears. Keep prenatal appointments. Ask how your clinic wants you to track movement from here.",
  },
  {
    week: 28,
    size: "About 38 cm",
    baby: "The third trimester starts. Eyelashes are present. Fat layers make the skin less see-through. The fetus is about an eggplant. Brain surface keeps folding, which adds thinking and sense capacity. The baby can blink. Bones are hard but the skull stays flexible. Lungs still need weeks of extra growth.",
    you: "Visits may become more frequent. Ask how to count fetal movements and what “too little” means for you. Premature birth at this stage still needs hospital care. You may have Braxton Hicks more often. Timed, regular contractions, fluid leaking, or bleeding need a same-day call. Rest your feet when they swell.",
  },
  {
    week: 29,
    size: "About 39 cm",
    baby: "The brain is forming more grooves. Bones are fully developed but still soft. The fetus can follow a light source from outside. Size is about a butternut squash. Muscle and fat increase weight faster now. The baby can tell light from dark. Taste and smell pathways keep wiring. Kicks have a clearer pattern.",
    you: "Shortness of breath can happen as the uterus lifts the diaphragm. Slow down on stairs. Report chest pain, a racing heart at rest, or breathlessness that is new and severe. Heartburn and constipation may continue. Eat smaller meals. Sleep on your side. Keep water and a snack by the bed if nights are long.",
  },
  {
    week: 30,
    size: "About 40 cm",
    baby: "Bone marrow is a main blood factory. Fine lanugo hair starts to thin. Eyes can focus to some degree. The fetus is about a large cabbage. The brain is adding connections every day. Toenails are growing. The baby still has room to turn, but less than before. Fat fills the cheeks a little more.",
    you: "Practice your birth-place route and a hospital bag if you plan a facility birth. Keep emergency numbers handy. You may feel more anxious about labor. Write questions for your next visit. Watch for regular tightenings, bleeding, or a gush of fluid. A drop in the baby’s usual movement needs a prompt call, not a wait-and-see.",
  },
  {
    week: 31,
    size: "About 41 cm",
    baby: "Hearing is quite sharp. Voices and music can reach the baby, though muffled. The fetus gains weight faster than length now. All five senses work in early form. Size is about a coconut. The lungs make more surfactant. The baby may have hiccups you feel as steady small jumps. Sleep and wake cycles are clearer.",
    you: "Braxton Hicks may feel stronger. Timed, regular tightenings with back pain or leaking need a same-day call. Your bump may feel tight after a long walk. Rest and sip water. Pelvic pressure can start. Wear stable shoes. Tell your clinician about itching all over, especially on hands and feet, which should be checked.",
  },
  {
    week: 32,
    size: "About 42 cm",
    baby: "Toenails are visible. The skin is less wrinkled as fat is stored. Most fetuses settle head-down around this period, but not all. Size is about a napa cabbage. The baby practices breathing motions more often. The immune system is still immature. The brain can control body temperature a little better than earlier weeks.",
    you: "Your clinician may check whether the baby is head-down. Sleeping on your back for long stretches is often discouraged in late pregnancy. Use pillows so a side position is easier. You may leak a little urine when you cough. Pelvic-floor squeezes can help if you were taught them. Call if water-like fluid keeps leaking.",
  },
  {
    week: 33,
    size: "About 44 cm",
    baby: "Skull bones are not fused. That gap helps the head pass through the birth canal and lets the brain keep growing after birth. Antibodies from you cross the placenta and give short-term protection. Size is about a pineapple. The baby is putting on fat around the shoulders and back. Lungs are more mature than last month, still not full term.",
    you: "Pelvic pressure and a waddling walk are common. Wear stable shoes. Avoid holding your breath when you lift. Keep objects close to your body and bend your knees. You may feel the baby’s head, bottom, or feet as lumps that move. Contractions that get regular, bleeding, or a fever need care now, not later.",
  },
  {
    week: 34,
    size: "About 45 cm",
    baby: "The central nervous system is more mature. The lungs keep practicing. Fingernails reach the fingertips. Size is about a cantaloupe. The baby can blink in response to light. Fat is smoothing the skin. If birth happens this week, specialist care is still likely, but outlook is better than in earlier preterm weeks.",
    you: "Group B strep screening is often offered in the coming weeks with a simple swab. Pack documents, a phone charger, and spare clothes if you are preparing a bag. You may feel extra tired. Nap if you can. Watch swelling. A sudden headache, vision change, or pain under the ribs on the right needs same-day care.",
  },
  {
    week: 35,
    size: "About 46 cm",
    baby: "Kidneys are fully developed. The fetus is cramped, so movements may feel like rolls and stretches more than sharp kicks. Size is about a honeydew melon. The baby is still gaining fat, which helps after birth. Most babies are head-down now. The lungs keep adding surfactant. Hearing and vision pathways keep refining.",
    you: "Frequent urination returns as the baby presses the bladder. A drop in daily movement is not something to wait on — contact your care team. You may have trouble finding a comfortable sleep position. Side lying with pillows is still the usual advice. Know the after-hours number. Tightening that you cannot talk through needs a call.",
  },
  {
    week: 36,
    size: "About 47 cm",
    baby: "This is early term. Fat continues to fill the cheeks. In a first pregnancy the head may drop into the pelvis (lightening). Size is about a romaine lettuce. The baby is almost as long as at birth and will mainly add weight now. Organs can work outside, but a few more weeks still help the lungs and brain.",
    you: "Breathing can feel easier if the baby drops. Pelvic pressure often increases, and walking may feel heavy. Know the labor signs you were taught: regular contractions, water breaking, bleeding, or a clear drop in movement. Finish work leave plans if you have them. Keep meals simple if heartburn is intense.",
  },
  {
    week: 37,
    size: "About 48 cm",
    baby: "The full-term range starts this week. Organs can work outside the uterus. A few more days of growth still help the lungs, brain, and fat stores. Size is about a Swiss chard bunch. Vernix may start to wash off. The baby is usually head-down and low. Grasp, suck, and startle reflexes are ready for life outside.",
    you: "Losing the mucus plug or seeing a pink streak (bloody show) can happen. That does not always mean labor is immediate. Regular contractions, water breaking, or bleeding still need care now. Rest between tasks. Have your bag and ride plan ready. Call if the baby’s usual movements slow down.",
  },
  {
    week: 38,
    size: "About 49 cm",
    baby: "Most vernix and lanugo are gone. The intestines hold meconium, the first sticky stool. The grasp reflex is strong. Size is about a leek bundle. The brain is still adding important connections. Lungs are usually ready. The baby waits for labor signals. Weight gain continues in small daily amounts.",
    you: "Rest when you can. Keep meals light if heartburn is intense. Continue movement counts every day. You may feel more pelvic pressure and Braxton Hicks. Time contractions if they become regular. A gush or slow leak of fluid, bleeding, fever, or a severe headache needs a call. Sleep on your side.",
  },
  {
    week: 39,
    size: "About 50 cm",
    baby: "The brain and lungs keep finishing small details. Most babies born this week do well with ordinary newborn care. Size is about a mini watermelon. Fat fills the arms and legs. The skull bones can shift during birth. The baby is ready to feed, cry, and keep warm with help. Due date is still next week for many people.",
    you: "Nesting energy comes and goes. Sleep on your side. Write down your clinician’s after-hours number. You may feel irritable, tearful, or very ready. That is common. Still go in for bleeding, fluid leaks, regular contractions, or less movement. Pack snacks and your ID. Confirm who will drive you.",
  },
  {
    week: 40,
    size: "About 51 cm",
    baby: "This is the typical due week: 40 weeks 0 days from the first day of your last period. Only some babies arrive on that exact day. Many come in the days around it. Size is about a small pumpkin. The baby is full term. The placenta still feeds the baby until birth. After 40 weeks your clinic may talk about extra checks.",
    you: "If you pass the due date, your clinic will discuss monitoring and next steps. Seek care for bleeding, fever, severe headache, vision changes, pain under the ribs, or a clear drop in movement. Regular contractions or water breaking mean it is time to call. This page is a screening guide, not a diagnosis or a birth plan.",
  },
];
