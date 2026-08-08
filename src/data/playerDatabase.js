/**
 * playerDatabase.js
 * 400+ IPL & International cricket players for fuzzy name matching.
 * These are NEVER shown as visible preset chips — only used as candidates
 * for the SmartNameInput fuzzy matcher.
 */

// ─── IPL – Mumbai Indians ────────────────────────────────────────────────────
export const MI_PLAYERS = [
  'Rohit Sharma', 'Ishan Kishan', 'Suryakumar Yadav', 'Hardik Pandya',
  'Jasprit Bumrah', 'Tim David', 'Tilak Varma', 'Naman Dhir',
  'Piyush Chawla', 'Akash Madhwal', 'Romario Shepherd', 'Dewald Brevis',
  'Tristan Stubbs', 'Nehal Wadhera', 'Hrithik Shokeen', 'Kumar Kartikeya',
  'Jason Behrendorff', 'Arjun Tendulkar', 'Vishnu Vinod', 'Shams Mulani',
  'Luke Wood', 'Ramanprit Singh', 'Sandeep Warrier', 'Duan Jansen',
  'Gerald Coetzee', 'Nuwan Thushara',
];

// ─── IPL – Chennai Super Kings ────────────────────────────────────────────────
export const CSK_PLAYERS = [
  'MS Dhoni', 'Ruturaj Gaikwad', 'Devon Conway', 'Deepak Chahar',
  'Ravindra Jadeja', 'Moeen Ali', 'Maheesh Theekshana', 'Matheesha Pathirana',
  'Tushar Deshpande', 'Ajinkya Rahane', 'Ben Stokes', 'Shivam Dube',
  'Sameer Rizvi', 'Rachin Ravindra', 'Daryl Mitchell', 'Nishant Sindhu',
  'Shaik Rasheed', 'Prashant Solanki', 'Simarjeet Singh', 'Richard Gleeson',
  'Mustafizur Rahman', 'Avanish Aravelly', 'Mitchell Santner',
];

// ─── IPL – Royal Challengers Bengaluru ────────────────────────────────────────
export const RCB_PLAYERS = [
  'Virat Kohli', 'Faf du Plessis', 'Glenn Maxwell', 'Mohammed Siraj',
  'Dinesh Karthik', 'Anuj Rawat', 'Cameron Green', 'Reece Topley',
  'Alzarri Joseph', 'Will Jacks', 'Suyash Prabhudessai', 'Mahipal Lomror',
  'Akash Deep', 'Yash Dayal', 'Himanshu Sharma', 'Mayank Dagar',
  'Tom Curran', 'Rajan Kumar', 'Karn Sharma', 'Lockie Ferguson',
  'Swapnil Singh', 'Vyshak Vijaykumar', 'Finn Allen',
];

// ─── IPL – Kolkata Knight Riders ─────────────────────────────────────────────
export const KKR_PLAYERS = [
  'Shreyas Iyer', 'Nitish Rana', 'Rinku Singh', 'Venkatesh Iyer',
  'Sunil Narine', 'Andre Russell', 'Varun Chakravarthy', 'Shardul Thakur',
  'Jason Roy', 'Mitchell Starc', 'Phil Salt', 'Angkrish Raghuvanshi',
  'Rahmanullah Gurbaz', 'Manish Pandey', 'Suyash Sharma', 'Spencer Johnson',
  'Harshit Rana', 'Mujeeb Ur Rahman', 'David Wiese', 'Sakib Hussain',
  'Ramandeep Singh', 'Anukul Roy', 'Chetan Sakariya',
];

// ─── IPL – Delhi Capitals ─────────────────────────────────────────────────────
export const DC_PLAYERS = [
  'David Warner', 'Axar Patel', 'Prithvi Shaw', 'Rishabh Pant',
  'Mitchell Marsh', 'Mustafizur Rahman', 'Anrich Nortje', 'Jake Fraser-McGurk',
  'Kuldeep Yadav', 'Lalit Yadav', 'Abhishek Porel', 'Yash Dhull',
  'Tristan Stubbs', 'Ricky Bhui', 'Ishant Sharma', 'Khaleel Ahmed',
  'Pravin Dubey', 'Kumar Kushagra', 'Rasikh Dar', 'Sumit Kumar',
  'Tom Abell', 'Vicky Ostwal', 'Jhye Richardson',
];

// ─── IPL – Punjab Kings ───────────────────────────────────────────────────────
export const PBKS_PLAYERS = [
  'Shikhar Dhawan', 'KL Rahul', 'Jonny Bairstow', 'Liam Livingstone',
  'Sam Curran', 'Arshdeep Singh', 'Shahrukh Khan', 'Jitesh Sharma',
  'Harpreet Brar', 'Nathan Ellis', 'Kagiso Rabada', 'Matthew Short',
  'Prabhsimran Singh', 'Atharva Taide', 'Rishi Dhawan', 'Sikandar Raza',
  'Harshal Patel', 'Rahul Chahar', 'Vidwath Kaverappa', 'Tanvir Sangha',
  'Bhanuka Rajapaksa', 'Baltej Singh', 'Mohit Rathee',
];

// ─── IPL – Rajasthan Royals ───────────────────────────────────────────────────
export const RR_PLAYERS = [
  'Jos Buttler', 'Sanju Samson', 'Shimron Hetmyer', 'Devdutt Padikkal',
  'Trent Boult', 'Yuzvendra Chahal', 'Yashasvi Jaiswal', 'Riyan Parag',
  'Dhruv Jurel', 'Sandeep Sharma', 'Kuldeep Sen', 'Navdeep Saini',
  'Adam Zampa', 'Ravichandran Ashwin', 'Prasidh Krishna', 'Obed McCoy',
  'Tom Kohler-Cadmore', 'Joe Root', 'Jason Roy', 'Kunal Rathmore',
  'Akash Vashisht', 'Abid Mushtaq', 'KC Cariappa',
];

// ─── IPL – Sunrisers Hyderabad ────────────────────────────────────────────────
export const SRH_PLAYERS = [
  'David Warner', 'Kane Williamson', 'Bhuvneshwar Kumar', 'T Natarajan',
  'Abhishek Sharma', 'Aiden Markram', 'Heinrich Klaasen', 'Mayank Agarwal',
  'Travis Head', 'Pat Cummins', 'Shahbaz Ahmed', 'Washington Sundar',
  'Marco Jansen', 'Fazalhaq Farooqi', 'Umran Malik', 'Anmolpreet Singh',
  'Glenn Phillips', 'Jaydev Unadkat', 'Akeal Hosein', 'Mayank Dagar',
  'Upendra Yadav', 'Nitish Kumar Reddy', 'Sanvir Singh',
];

// ─── IPL – Gujarat Titans ─────────────────────────────────────────────────────
export const GT_PLAYERS = [
  'Shubman Gill', 'Hardik Pandya', 'Rashid Khan', 'Mohammed Shami',
  'David Miller', 'Wriddhiman Saha', 'Abhinav Manohar', 'Sai Sudharsan',
  'Noor Ahmad', 'Vijay Shankar', 'Matthew Wade', 'Darshan Nalkande',
  'Jayant Yadav', 'Mohit Sharma', 'Azmatullah Omarzai', 'Shahrukh Khan',
  'Alzarri Joseph', 'Kane Williamson', 'Sushant Mishra', 'Spencer Johnson',
  'Joshua Little', 'Urvil Patel', 'Manav Suthar',
];

// ─── IPL – Lucknow Super Giants ───────────────────────────────────────────────
export const LSG_PLAYERS = [
  'KL Rahul', 'Quinton de Kock', 'Deepak Hooda', 'Marcus Stoinis',
  'Krunal Pandya', 'Avesh Khan', 'Mohsin Khan', 'Ayush Badoni',
  'Kyle Mayers', 'Mark Wood', 'Naveen-ul-Haq', 'Prerak Mankad',
  'Ravi Bishnoi', 'Manan Vohra', 'Amit Mishra', 'Daniel Sams',
  'Nicholas Pooran', 'Romario Shepherd', 'Yash Thakur', 'Swapnil Singh',
  'Shamar Joseph', 'Devdutt Padikkal', 'Matt Henry',
];

// ─── Indian National Team ─────────────────────────────────────────────────────
export const INDIA_PLAYERS = [
  // Batsmen
  'Virat Kohli', 'Rohit Sharma', 'Shubman Gill', 'KL Rahul', 'Yashasvi Jaiswal',
  'Shreyas Iyer', 'Rishabh Pant', 'Suryakumar Yadav', 'Tilak Varma',
  'Ruturaj Gaikwad', 'Ishan Kishan', 'Sanju Samson', 'Abhishek Sharma',
  'Rinku Singh', 'Dhruv Jurel', 'Prithvi Shaw', 'Devdutt Padikkal',
  'Mayank Agarwal', 'Shikhar Dhawan', 'Ajinkya Rahane', 'Cheteshwar Pujara',
  // Legends
  'Sachin Tendulkar', 'MS Dhoni', 'Sourav Ganguly', 'Rahul Dravid',
  'VVS Laxman', 'Suresh Raina', 'Yuvraj Singh', 'Gautam Gambhir',
  'Virender Sehwag', 'Adam Gilchrist', 'Dinesh Karthik', 'Robin Uthappa',
  'Ambati Rayudu', 'Murali Vijay', 'Wriddhiman Saha', 'Manish Pandey',
  'Parthiv Patel',
  // All-rounders
  'Hardik Pandya', 'Ravindra Jadeja', 'Axar Patel', 'Venkatesh Iyer',
  'Washington Sundar', 'Krunal Pandya', 'Deepak Hooda', 'Vijay Shankar',
  'Stuart Binny', 'Irfan Pathan', 'Yusuf Pathan', 'Shahbaz Ahmed',
  // Bowlers
  'Jasprit Bumrah', 'Mohammed Shami', 'Mohammed Siraj', 'Ravichandran Ashwin',
  'Kuldeep Yadav', 'Yuzvendra Chahal', 'Bhuvneshwar Kumar', 'Arshdeep Singh',
  'Umesh Yadav', 'Ishant Sharma', 'Zaheer Khan', 'Harbhajan Singh',
  'Prasidh Krishna', 'Deepak Chahar', 'Shardul Thakur', 'T Natarajan',
  'Avesh Khan', 'Harshal Patel', 'Sandeep Sharma', 'Piyush Chawla',
  'Amit Mishra', 'Khaleel Ahmed', 'Navdeep Saini', 'Jaydev Unadkat',
  'Umran Malik', 'Akash Deep', 'Yash Dayal', 'Mukesh Kumar',
];

// ─── Australia ────────────────────────────────────────────────────────────────
export const AUSTRALIA_PLAYERS = [
  'Steve Smith', 'David Warner', 'Pat Cummins', 'Mitchell Starc',
  'Josh Hazlewood', 'Glenn Maxwell', 'Travis Head', 'Marcus Stoinis',
  'Aaron Finch', 'Matthew Wade', 'Cameron Green', 'Adam Zampa',
  'Nathan Lyon', 'Mitchell Marsh', 'Matthew Hayden', 'Ricky Ponting',
  'Andrew Symonds', 'Shane Watson', 'Michael Hussey', 'Michael Clarke',
  'Jason Behrendorff', 'Spencer Johnson', 'Jake Fraser-McGurk',
  'Matthew Short', 'Tim David',
];

// ─── England ──────────────────────────────────────────────────────────────────
export const ENGLAND_PLAYERS = [
  'Ben Stokes', 'Jos Buttler', 'Jonny Bairstow', 'Sam Curran',
  'Chris Woakes', 'Moeen Ali', 'Adil Rashid', 'Liam Livingstone',
  'Jason Roy', 'Eoin Morgan', 'Mark Wood', 'Tom Curran',
  'Reece Topley', 'Jamie Overton', 'Joe Root', 'Stuart Broad',
  'James Anderson', 'Andrew Flintoff', 'Kevin Pietersen', 'Graeme Swann',
  'Phil Salt', 'Harry Brook', 'Zak Crawley', 'Ollie Pope',
  'Dawid Malan', 'Tom Kohler-Cadmore', 'Will Jacks',
];

// ─── West Indies ──────────────────────────────────────────────────────────────
export const WINDIES_PLAYERS = [
  'Chris Gayle', 'Andre Russell', 'Sunil Narine', 'Dwayne Bravo',
  'Kieron Pollard', 'Nicholas Pooran', 'Shimron Hetmyer', 'Jason Holder',
  'Romario Shepherd', 'Obed McCoy', 'Carlos Braithwaite', 'Darren Sammy',
  'Brian Lara', 'Vivian Richards', 'Clive Lloyd', 'Curtly Ambrose',
  'Courtney Walsh', 'Malcolm Marshall', 'Shivnarine Chanderpaul',
  'Kyle Mayers', 'Fabian Allen', 'Alzarri Joseph', 'Akeal Hosein',
  'Shamar Joseph', 'Gudakesh Motie', 'Roston Chase',
];

// ─── South Africa ─────────────────────────────────────────────────────────────
export const SA_PLAYERS = [
  'Kagiso Rabada', 'Quinton de Kock', 'Faf du Plessis', 'David Miller',
  'AB de Villiers', 'Anrich Nortje', 'Lungi Ngidi', 'Tabraiz Shamsi',
  'Aiden Markram', 'Heinrich Klaasen', 'Rassie van der Dussen',
  'Wayne Parnell', 'Dwaine Pretorius', 'Marco Jansen', 'Gerald Coetzee',
  'Rilee Rossouw', 'Reeza Hendricks', 'Ryan Rickelton', 'Tristan Stubbs',
  'Dewald Brevis', 'Lizaad Williams', 'Sisanda Magala', 'Jacques Kallis',
  'Shaun Pollock', 'Graeme Smith',
];

// ─── New Zealand ──────────────────────────────────────────────────────────────
export const NZ_PLAYERS = [
  'Kane Williamson', 'Trent Boult', 'Martin Guptill', 'Tim Southee',
  'Kyle Jamieson', 'Mitchell McClenaghan', 'Devon Conway', 'Daryl Mitchell',
  'Glenn Phillips', 'Lockie Ferguson', 'Matt Henry', 'Ish Sodhi',
  'Mark Chapman', 'Finn Allen', 'Rachin Ravindra', 'Mitchell Santner',
  'Tom Latham', 'Brendon McCullum',
];

// ─── Pakistan ─────────────────────────────────────────────────────────────────
export const PAKISTAN_PLAYERS = [
  'Babar Azam', 'Shaheen Afridi', 'Mohammad Amir', 'Shoaib Akhtar',
  'Wasim Akram', 'Waqar Younis', 'Inzamam-ul-Haq', 'Mohammad Yousuf',
  'Fakhar Zaman', 'Iftikhar Ahmed', 'Shadab Khan', 'Haris Rauf',
  'Naseem Shah', 'Mohammad Wasim Jr', 'Rizwan Mohammad', 'Imad Wasim',
  'Saim Ayub', 'Usman Khan', 'Abrar Ahmed', 'Mohammad Nawaz',
];

// ─── Sri Lanka ────────────────────────────────────────────────────────────────
export const SL_PLAYERS = [
  'Lasith Malinga', 'Angelo Mathews', 'Kusal Mendis', 'Wanindu Hasaranga',
  'Dushmantha Chameera', 'Maheesh Theekshana', 'Matheesha Pathirana',
  'Niroshan Dickwella', 'Sanath Jayasuriya', 'Mahela Jayawardene',
  'Chaminda Vaas', 'Aravinda de Silva', 'Nuwan Thushara', 'Jeffrey Vandersay',
  'Asitha Fernando', 'Pathum Nissanka', 'Charith Asalanka',
];

// ─── Bangladesh ───────────────────────────────────────────────────────────────
export const BD_PLAYERS = [
  'Shakib Al Hasan', 'Mushfiqur Rahim', 'Mustafizur Rahman',
  'Taskin Ahmed', 'Liton Das', 'Mehidy Hasan Miraz', 'Ebadot Hossain',
  'Shoriful Islam', 'Najmul Hossain Shanto',
];

// ─── Afghanistan ──────────────────────────────────────────────────────────────
export const AFG_PLAYERS = [
  'Rashid Khan', 'Mujeeb Ur Rahman', 'Mohammad Nabi', 'Azmatullah Omarzai',
  'Rahmanullah Gurbaz', 'Ibrahim Zadran', 'Noor Ahmad', 'Naveen-ul-Haq',
  'Fazalhaq Farooqi',
];

// ─── Ireland & Others ─────────────────────────────────────────────────────────
export const OTHER_PLAYERS = [
  'Sikandar Raza', 'Craig Ervine', 'Paul Stirling', 'Joshua Little',
  'Lorcan Tucker',
];

// ─── All Players Combined ─────────────────────────────────────────────────────
export const ALL_PLAYERS = [
  ...new Set([
    ...MI_PLAYERS, ...CSK_PLAYERS, ...RCB_PLAYERS, ...KKR_PLAYERS,
    ...DC_PLAYERS, ...PBKS_PLAYERS, ...RR_PLAYERS, ...SRH_PLAYERS,
    ...GT_PLAYERS, ...LSG_PLAYERS,
    ...INDIA_PLAYERS, ...AUSTRALIA_PLAYERS, ...ENGLAND_PLAYERS,
    ...WINDIES_PLAYERS, ...SA_PLAYERS, ...NZ_PLAYERS,
    ...PAKISTAN_PLAYERS, ...SL_PLAYERS, ...BD_PLAYERS,
    ...AFG_PLAYERS, ...OTHER_PLAYERS,
  ])
];

// ─── Featured Visible Chips (shown in UI as quick-picks) ─────────────────────
// Only these ~12 are shown as clickable chips in the setup card.
// The rest (ALL_PLAYERS) power the invisible fuzzy matcher.
export const FEATURED_CHIPS = [
  'Virat Kohli', 'MS Dhoni', 'Rohit Sharma', 'Jasprit Bumrah',
  'Rashid Khan', 'Jos Buttler', 'Andre Russell', 'AB de Villiers',
  'Chris Gayle', 'Suryakumar Yadav', 'Yashasvi Jaiswal', 'Shubman Gill',
];
