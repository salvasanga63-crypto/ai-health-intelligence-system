export default function handler(req, res) {
  const slides = [
    {
      id: 'expectant',
      title: 'Comprehensive Prenatal Tracking & Maternal Guidance',
      body:
        'Our specialized maternal registry offers expectant mothers structured guidance throughout every trimester of pregnancy. Clinicians can monitor fetal development, track maternal health telemetry, schedule vital scan appointments, and access tailored nutritional guidelines to ensure a safe, supported path to delivery.',
      image: '/images/maternity-placeholder.svg',
      cluster: 'Maternity Cluster',
    },
    {
      id: 'lactating',
      title: 'Postpartum Recovery & Newborn Nutrition Support',
      body:
        'Navigating the postpartum journey requires dedicated clinical attention. This panel provides mothers with expert lactation consulting records, neonatal growth monitoring, and maternal mental health tracking. Our system actively syncs postnatal checkups to optimize infant nutrition and support maternal recovery milestones.',
      image: '/images/lactating-placeholder.svg',
      cluster: 'Postnatal Care Cluster',
    },
    {
      id: 'elders',
      title: 'Advanced Geriatric Care & Chronic Disease Management',
      body:
        'Dedicated to optimizing health and quality of life for senior citizens. This interface allows medical staff to coordinate multi-specialist care plans, track routine cognitive assessments, manage complex medication regimens, and monitor age-specific mobility and cardiovascular telemetry streams.',
      image: '/images/elders-placeholder.svg',
      cluster: 'Geriatric Medicine Cluster',
    },
    {
      id: 'women',
      title: "Specialized Preventive Care & Wellness Services for Women",
      body:
        "A comprehensive clinical workspace for women's healthcare across all stages of life. Staff can track essential preventive screenings, manage general gynecological and reproductive health records, log diagnostic telemetry, and deploy community health outreach initiatives optimized for women's wellness.",
      image: '/images/women-placeholder.svg',
      cluster: "Women's Health Cluster",
    },
    {
      id: 'children_u5',
      title: 'Critical Early Childhood Growth & Immunization Tracking',
      body:
        'The first five years are vital for neurodevelopment and physical growth. This registry automates standard pediatric immunization schedules, monitors early childhood growth percentiles, tracks acute pediatric infectious risks, and ensures immediate clinical prioritization for infants and toddlers in our triage system.',
      image: '/images/children-u5-placeholder.svg',
      cluster: 'Early Childhood Pediatrics Cluster',
    },
    {
      id: 'children_5_17',
      title: 'School-Age Development & Adolescent Healthcare Monitoring',
      body:
        'Designed to track physical development, mental well-being, and nutritional health throughout childhood and adolescence. Features integrated tracking for school physicals, mandatory vaccination updates, behavioral health assessments, and early interventions for youth and teenagers.',
      image: '/images/children-5-17-placeholder.svg',
      cluster: 'Adolescent Medicine Cluster',
    },
    {
      id: 'men',
      title: 'Preventive Screening & Comprehensive Health Protocols for Men',
      body:
        'Focused on promoting proactive healthcare behaviors and addressing gender-specific medical risks in men. This includes clinical workflows for tracking metabolic health tracking, cardiovascular risk assessments, and age-related prostate and urological screenings.',
      image: '/images/men-placeholder.svg',
      cluster: "General Men's Health Cluster",
    },
    {
      id: 'whole',
      title: 'Unified Patient Records & Holistic Family Medicine Portal',
      body:
        'The foundational bedrock of our Health Intelligence Platform. This view aggregates primary care, holistic family health history, broad outpatient tracking data, and global diagnostic telemetry, enabling inter-departmental collaboration across all medical disciplines.',
      image: '/images/wholepatients-placeholder.svg',
      cluster: 'General Medicine Cluster',
    },
  ];

  res.setHeader('Cache-Control', 'public, max-age=60');
  res.status(200).json({ slides });
}
