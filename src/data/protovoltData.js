export const COMPANY_INFO = {
  name: 'Protovolt.io',
  email: 'rakshan4664@gmail.com',
  emailHref: 'mailto:rakshan4664@gmail.com',
  phoneDisplay: '+91 96265 28585',
  phoneRaw: '9626528585',
  phoneHref: 'tel:+919626528585',
  whatsappHref: 'https://wa.me/919626528585',
  address: '2/52, Sudha Rice Mill, Nathampalayam, Semnianallur, Avinashi - 641654',
  gst: '33ABJFP3401A1ZY'
};

export const MARQUEE_ITEMS = [
  'Industrial Automation',
  'Robotics',
  'AI & Machine Learning',
  'Machine Vision',
  'Industrial IoT',
  'LightGuide Augmented Intelligence'
];

export const SYSTEM_FLOW_STEPS = [
  {
    num: 'Step 01',
    svgTag: '01 · SENSE',
    svgTitle: 'Vision & Sensors',
    svgSub: 'Cameras · Lasers · Sensors',
    title: 'Vision & Sensing',
    shortDesc: 'Cameras and industrial sensors inspect parts and track machine status in real time.',
    detail:
      'High-speed cameras, custom lighting, and industrial sensors capture accurate part measurements on the factory floor.'
  },
  {
    num: 'Step 02',
    svgTag: '02 · PROCESS',
    svgTitle: 'Embedded & AI',
    svgSub: 'Custom Boards · Edge AI',
    title: 'Embedded & AI',
    shortDesc: 'Custom electronics and local AI process data in milliseconds right on the machine.',
    detail:
      'Custom circuit boards and local AI process sensor and camera data in milliseconds right on the machine.'
  },
  {
    num: 'Step 03',
    svgTag: '03 · ACT',
    svgTitle: 'Robotics & Control',
    svgSub: 'Robots · Grippers · PLCs',
    title: 'Robotics & Motion',
    shortDesc: 'Robotic arms, grippers, and PLCs handle assembly, sorting, and precise part movement.',
    detail:
      'Robotic arms, custom grippers, servos, and PLCs carry out fast, accurate sorting, handling, and assembly.'
  },
  {
    num: 'Step 04',
    svgTag: '04 · MONITOR',
    svgTitle: 'IIoT & Data',
    svgSub: 'Live Dashboards · Alerts',
    title: 'Connected Data',
    shortDesc: 'Smart gateways send live production counts, uptime, and alerts to your dashboard.',
    detail:
      'Smart gateways send live production counts, machine health, and quality alerts to your dashboard.'
  }
];

export const CORE_CAPABILITIES = [
  {
    num: '01',
    id: 'Industrial Automation',
    title: 'Industrial Automation',
    icon: 'automation',
    summary:
      'Custom automated machines, PLC control panels, motion systems, and smart upgrades for production lines.',
    points: [
      'PLC, HMI & SCADA Controls',
      'Custom Production Machines',
      'Precision Motion Systems'
    ]
  },
  {
    num: '02',
    id: 'Robotics',
    title: 'Robotics',
    icon: 'robotics',
    summary:
      'Complete robotic systems, collaborative robots, custom grippers, and automated pick-and-place systems.',
    points: [
      'Robotic & Cobot Workcells',
      'AMR & AVG',
      'Custom Grippers & Tooling',
      'Vision-Guided Pick & Place'
    ]
  },
  {
    num: '03',
    id: 'AI & ML',
    title: 'AI & ML',
    icon: 'ai',
    summary:
      'Practical AI built for factory hardware to spot defects, predict maintenance needs, and improve quality.',
    points: [
      'Fast On-Device Edge AI',
      'Predictive Maintenance',
      'Smart Quality Monitoring'
    ]
  },
  {
    num: '04',
    id: 'Machine Vision',
    title: 'Machine Vision',
    icon: 'vision',
    summary:
      'High-speed camera inspection for finding surface defects, checking part dimensions, and reading labels.',
    points: [
      'Automated Defect Detection',
      '2D & 3D Part Measurement',
      'Barcode & Text Verification'
    ]
  },
  {
    num: '05',
    id: 'IoT & IIoT',
    title: 'Industrial IoT & Embedded Systems',
    icon: 'iiot',
    summary:
      'Connected sensors, embedded controllers, machine gateways, and dashboards for industrial systems.',
    points: [
      'Machine Data Gateways',
      'Cloud & Local Dashboards',
      'Embedded Controllers & Firmware',
      'Energy & Uptime Tracking'
    ]
  },
  {
    num: '06',
    id: 'LightGuide Augmented Intelligence',
    title: 'LightGuide Augmented Intelligence',
    icon: 'lightguide',
    summary: 'Projected visual guidance helps operators follow assembly and inspection steps directly at the work surface.',
    points: [
      'Projected Step-by-Step Guidance',
      'Vision-Assisted Process Verification',
      'Operator Training & Workflow Support'
    ]
  }
];

export const SOLUTIONS_TABS = [
  {
    key: 'vision',
    idx: '01',
    tabName: 'Vision & Inspection',
    img: '/assets/vision-ai.jpg',
    alt: 'Industrial camera inspecting a circuit board',
    caption: 'Automated Camera Inspection',
    badge: 'Vision & AI',
    eyebrow: 'Quality Inspection',
    heading: 'Vision & AI Inspection Systems',
    copy: 'High-speed camera stations that spot defects, check assembly accuracy, measure part dimensions, and automatically reject faulty parts on moving lines.',
    loopLabel: 'Real-Time Inspection',
    steps: [
      { num: '01 · Light', title: 'Precision Lens & LED Lighting' },
      { num: '02 · Capture', title: 'High-Speed Industrial Camera' },
      { num: '03 · Check', title: 'AI Defect & Dimension Check' },
      { num: '04 · Sort', title: 'Auto Reject & Quality Log' }
    ],
    checks: [
      'Scratch, crack & assembly defect detection',
      'Accurate 2D & 3D part measurement',
      'Custom industrial lighting setups',
      'Direct connection to factory PLCs'
    ],
    scopes: ['Machine Vision', 'AI & ML', 'Industrial Automation']
  },
  {
    key: 'robotics',
    idx: '02',
    tabName: 'Automation & Robotics',
    img: '/assets/hero-robotics.jpg',
    alt: 'Industrial robotic arm inspecting a precision metal part',
    caption: 'Robotic Assembly & Handling',
    badge: 'Robotics & Control',
    eyebrow: 'Automation & Robotics',
    heading: 'Custom Automation & Robotic Cells',
    copy: 'Complete robotic cells, collaborative robot stations, and custom automated machines built for fast, repeatable manufacturing.',
    loopLabel: 'Precision Motion',
    steps: [
      { num: '01 · Feed', title: 'Part Feeding & Positioning' },
      { num: '02 · Locate', title: 'Camera Part Alignment' },
      { num: '03 · Move', title: 'Robotic Pick, Place & Assembly' },
      { num: '04 · Verify', title: 'Safety & Cycle Check' }
    ],
    checks: [
      '6-axis, SCARA & collaborative robot cells',
      'Custom grippers & end-of-arm tooling',
      'PLC, servo & safety controller programming',
      'Complete mechanical & electrical build'
    ],
    scopes: ['Industrial Automation', 'Robotics', 'Machine Vision']
  },
  {
    key: 'embedded',
    idx: '03',
    tabName: 'Embedded & IIoT',
    img: '/assets/embedded-iiot.jpg',
    alt: 'Custom industrial circuit board beside aluminum enclosure',
    caption: 'Custom Controller & Gateway',
    badge: 'Embedded & IIoT',
    eyebrow: 'Connected Hardware',
    heading: 'Embedded Electronics & IIoT Systems',
    copy: 'Custom circuit boards, smart sensor nodes, and industrial gateways that connect new or existing machines to live production dashboards.',
    loopLabel: 'Live Machine Data',
    steps: [
      { num: '01 · Sense', title: 'Industrial Sensor Inputs' },
      { num: '02 · Process', title: 'Custom Controller & Firmware' },
      { num: '03 · Connect', title: 'PLC & Network Gateway' },
      { num: '04 · Track', title: 'Live Dashboard & Alerts' }
    ],
    checks: [
      'Custom PCB design & rugged enclosures',
      'Reliable firmware & embedded Linux software',
      'Modbus, OPC-UA, CAN & wireless connectivity',
      'Live uptime, output & energy tracking'
    ],
    scopes: ['IoT & IIoT']
  },
  {
    key: 'lightguide',
    idx: '04',
    tabName: 'LightGuide & Operator Guidance',
    eyebrow: 'Augmented Intelligence',
    heading: 'LightGuide Augmented Intelligence',
    copy: 'Projected visual instructions guide operators through manual assembly and inspection tasks at the workstation, with vision and sensors supporting process checks.',
    loopLabel: 'Guide · Check · Continue',
    steps: [
      { num: '01 · Guide', title: 'Project the Next Work Instruction' },
      { num: '02 · Assemble', title: 'Identify Parts and Work Locations' },
      { num: '03 · Verify', title: 'Check the Step with Vision or Sensors' },
      { num: '04 · Continue', title: 'Advance Through the Workflow' }
    ],
    checks: [
      'Visual instructions at the work surface',
      'Step-by-step support for manual workflows',
      'Vision and sensor-assisted checks',
      'Support for assembly, inspection and training'
    ],
    scopes: ['LightGuide Augmented Intelligence', 'Machine Vision']
  }
];

export const PROCESS_STAGES = [
  {
    num: '01',
    phase: 'Step 01',
    title: 'Concept & System Plan',
    desc: 'We review your process goals, speed targets, and space limits to create a clear technical plan.',
    output: 'System Plan & Hardware Specification'
  },
  {
    num: '02',
    phase: 'Step 02',
    title: 'System Design',
    desc: 'We develop the mechanical, electrical, and software design around your project requirements.',
    output: 'Detailed Engineering Design'
  },
  {
    num: '03',
    phase: 'Step 03',
    title: 'Hardware & Software Development',
    desc: 'Our team designs the final circuit boards, mechanical assemblies, control software, and AI models together.',
    output: 'Production Hardware & Control Software'
  },
  {
    num: '04',
    phase: 'Step 04',
    title: 'Testing & Quality Checks',
    desc: 'Every system goes through continuous run testing, safety checks, and accuracy tuning before leaving our lab.',
    output: 'Factory Acceptance & Test Report'
  },
  {
    num: '05',
    phase: 'Step 05',
    title: 'System Integration',
    desc: 'We connect the new system cleanly with your conveyors, robots, PLCs, and factory software.',
    output: 'Connected & Ready-to-Run System'
  },
  {
    num: '06',
    phase: 'Step 06',
    title: 'Deployment & Support',
    desc: 'We handle on-site setup, team training, full documentation handover, and ongoing technical support.',
    output: 'Live System, Training & Full Documentation'
  }
];

export const INDUSTRIES = [
  {
    idx: '01',
    title: 'Manufacturing',
    desc: 'Automated assembly stations, part measurement, error-proofing, and live production tracking.'
  },
  {
    idx: '02',
    title: 'Automotive',
    desc: 'Part quality inspection, robotic assembly systems, and electronic test rigs.'
  },
  {
    idx: '03',
    title: 'Electronics & Hardware',
    desc: 'PCB camera inspection, automated test fixtures, custom controllers, and product enclosures.'
  },
  {
    idx: '04',
    title: 'Packaging, Pharma & FMCG',
    desc: 'High-speed label and text checks, seal inspection, vision sorting, and batch tracking.'
  },
  {
    idx: '05',
    title: 'Energy & Infrastructure',
    desc: 'Remote monitoring gateways, equipment health alerts, safety sensors, and power tracking.'
  },
  {
    idx: '06',
    title: 'R&D & Product Teams',
    desc: 'Custom sensor boards, connected hardware, and engineering support for product teams.'
  }
];

export const FAQ_ITEMS = [
  {
    q: 'Can we start with just an early idea or factory problem?',
    a: 'Yes. Many projects start with an operational challenge or a rough product idea. We help define the technical plan and requirements for your project.'
  },
  {
    q: 'Can your systems connect with our existing machines and PLCs?',
    a: 'Yes. We design camera stations, sensor gateways, and controllers that work smoothly alongside your current PLCs, conveyors, and plant software without disrupting production.'
  },
  {
    q: 'How do you protect our confidential designs and IP?',
    a: 'We sign a Mutual NDA before reviewing any designs or process details, and provide full CAD, circuit, and software documentation according to your project agreement.'
  },
  {
    q: 'Do your AI and vision systems need internet access to run?',
    a: 'No. Inspection and machine control run locally on industrial hardware for instant, reliable operation without internet. Cloud or local dashboards are optional for reporting.'
  },
  {
    q: 'Do you build both custom factory machines and commercial products?',
    a: 'Yes. We build custom automation and inspection machines for factories, and we also develop commercial hardware products from system design through engineering and production.'
  }
];
