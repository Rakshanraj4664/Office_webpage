export const COMPANY_INFO = {
  name: 'Protovolt.io',
  email: 'tech@protovolt.io',
  emailHref: 'mailto:tech@protovolt.io',
  phoneDisplay: '+91 96265 28585',
  phoneRaw: '9626528585',
  phoneHref: 'tel:+919626528585',
  address: '2/52, Sudha Rice Mill, Nathampalayam, Semnianallur, Avinashi - 641654',
  gst: '33ABJFP3401A1ZY'
};

export const MARQUEE_ITEMS = [
  'Industrial Automation',
  'Robotics',
  'AI & Machine Learning',
  'Machine Vision',
  'Industrial IoT',
  'Embedded Systems',
  'Rapid Prototyping',
  'Product Development'
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
      'Complete robotic cells, collaborative robots, custom grippers, and automated pick-and-place systems.',
    points: [
      'Robotic & Cobot Workcells',
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
    title: 'Industrial IoT (IIoT)',
    icon: 'iiot',
    summary:
      'Connected sensors, machine gateways, and live dashboards to track output, uptime, and energy across plants.',
    points: [
      'Machine Data Gateways',
      'Cloud & Local Dashboards',
      'Energy & Uptime Tracking'
    ]
  },
  {
    num: '06',
    id: 'Embedded Systems',
    title: 'Embedded Systems',
    icon: 'embedded',
    summary:
      'Custom circuit boards (PCBs), industrial controllers, and reliable embedded software built for 24/7 use.',
    points: [
      'Custom PCB Design',
      'Embedded Firmware & Linux',
      'Rugged Industrial Controllers'
    ]
  },
  {
    num: '07',
    id: 'Rapid Prototyping',
    title: 'Rapid Prototyping',
    icon: 'prototyping',
    summary:
      'Fast working prototypes combining CAD design, 3D printing, machined parts, and electronics to test ideas early.',
    points: [
      'Working Proof-of-Concepts',
      'CAD, 3D Printing & CNC Parts',
      'Early Design Validation'
    ]
  },
  {
    num: '08',
    id: 'Product Development',
    title: 'Product Development',
    icon: 'product',
    summary:
      'Complete product engineering from durable enclosure design and testing to production-ready hardware.',
    points: [
      'Industrial Enclosures',
      'Design for Manufacturing',
      'Production Test Fixtures'
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
    scopes: ['Embedded Systems', 'IoT & IIoT', 'Product Development']
  },
  {
    key: 'prototyping',
    idx: '04',
    tabName: 'Prototyping & Products',
    img: '/assets/prototyping-lab.jpg',
    alt: 'Rapid prototyping and automation workbench',
    caption: 'Rapid Prototyping & Product Build',
    badge: 'Prototyping & R&D',
    eyebrow: 'Concept to Product',
    heading: 'Rapid Prototyping & Product Development',
    copy: 'Turn new ideas into working hardware quickly using CAD design, 3D printing, machined parts, custom electronics, and pilot testing.',
    loopLabel: 'Build · Test · Refine',
    steps: [
      { num: '01 · Design', title: '3D CAD & Circuit Design' },
      { num: '02 · Build', title: '3D Printing, CNC & PCB Build' },
      { num: '03 · Test', title: 'Lab Testing & Refinement' },
      { num: '04 · Scale', title: 'Production-Ready Handover' }
    ],
    checks: [
      'Fast working prototypes to test ideas early',
      '3D printing & CNC parts integrated with electronics',
      'Durable industrial enclosure engineering',
      'Complete manufacturing files & pilot test rigs'
    ],
    scopes: ['Rapid Prototyping', 'Product Development', 'Embedded Systems']
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
    title: 'Rapid Prototyping',
    desc: 'We build fast working prototypes using CAD, 3D printing, machined parts, and test electronics to prove performance early.',
    output: 'Working Prototype & Test Results'
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
    title: 'Automotive & EV',
    desc: 'Part quality inspection, robotic assembly cells, electronic test rigs, and battery module checks.'
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
    desc: 'Rapid working prototypes, custom sensor boards, and turning new ideas into commercial products.'
  }
];

export const FAQ_ITEMS = [
  {
    q: 'Can we start with just an early idea or factory problem?',
    a: 'Yes. Many projects start with an operational challenge or a rough product idea. We help define the technical plan and build a working prototype before full-scale production.'
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
    a: 'Yes. We build custom automation and inspection machines for factories, and we also develop commercial hardware products from initial prototype to pilot manufacturing.'
  }
];
