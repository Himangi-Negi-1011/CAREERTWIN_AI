export interface Institution {
  name: string;
  location: string;
  type: "University" | "Institute of Technology" | "College" | "Business School" | "Autonomous";
  aliases: string[];
}

export const curatedInstitutions: Institution[] = [
  // India - Premier Institutes
  { name: "Indian Institute of Technology Bombay (IIT Bombay)", location: "Mumbai, Maharashtra", type: "Institute of Technology", aliases: ["IITB", "IIT Bombay"] },
  { name: "Indian Institute of Technology Delhi (IIT Delhi)", location: "New Delhi, Delhi", type: "Institute of Technology", aliases: ["IITD", "IIT Delhi"] },
  { name: "Indian Institute of Technology Madras (IIT Madras)", location: "Chennai, Tamil Nadu", type: "Institute of Technology", aliases: ["IITM", "IIT Madras"] },
  { name: "Indian Institute of Technology Kanpur (IIT Kanpur)", location: "Kanpur, Uttar Pradesh", type: "Institute of Technology", aliases: ["IITK", "IIT Kanpur"] },
  { name: "Indian Institute of Technology Kharagpur (IIT Kharagpur)", location: "Kharagpur, West Bengal", type: "Institute of Technology", aliases: ["IITKGP", "IIT Kharagpur"] },
  { name: "Indian Institute of Technology Roorkee (IIT Roorkee)", location: "Roorkee, Uttarakhand", type: "Institute of Technology", aliases: ["IITR", "IIT Roorkee"] },
  { name: "Indian Institute of Technology Guwahati (IIT Guwahati)", location: "Guwahati, Assam", type: "Institute of Technology", aliases: ["IITG", "IIT Guwahati"] },
  { name: "Indian Institute of Science (IISc)", location: "Bangalore, Karnataka", type: "University", aliases: ["IISc", "IISc Bangalore"] },
  { name: "Birla Institute of Technology and Science (BITS Pilani)", location: "Pilani, Rajasthan", type: "Institute of Technology", aliases: ["BITS", "BITS Pilani"] },
  { name: "BITS Pilani - Goa Campus", location: "Goa", type: "Institute of Technology", aliases: ["BITS Goa"] },
  { name: "BITS Pilani - Hyderabad Campus", location: "Hyderabad, Telangana", type: "Institute of Technology", aliases: ["BITS Hyderabad"] },
  { name: "International Institute of Information Technology Hyderabad (IIIT-H)", location: "Hyderabad, Telangana", type: "Institute of Technology", aliases: ["IIIT Hyderabad", "IIITH"] },
  { name: "International Institute of Information Technology Bangalore (IIIT-B)", location: "Bangalore, Karnataka", type: "Institute of Technology", aliases: ["IIIT Bangalore", "IIITB"] },
  { name: "National Institute of Technology Tiruchirappalli (NIT Trichy)", location: "Tiruchirappalli, Tamil Nadu", type: "Institute of Technology", aliases: ["NIT Trichy", "NITT"] },
  { name: "National Institute of Technology Karnataka (NIT Surathkal)", location: "Surathkal, Karnataka", type: "Institute of Technology", aliases: ["NIT Surathkal", "NITK"] },
  { name: "National Institute of Technology Warangal (NIT Warangal)", location: "Warangal, Telangana", type: "Institute of Technology", aliases: ["NIT Warangal", "NITW"] },
  { name: "National Institute of Technology Rourkela (NIT Rourkela)", location: "Rourkela, Odisha", type: "Institute of Technology", aliases: ["NIT Rourkela", "NITR"] },
  { name: "National Institute of Technology Calicut (NIT Calicut)", location: "Calicut, Kerala", type: "Institute of Technology", aliases: ["NIT Calicut", "NITC"] },
  { name: "Delhi Technological University (DTU)", location: "New Delhi, Delhi", type: "University", aliases: ["DTU", "DCE"] },
  { name: "Netaji Subhas University of Technology (NSUT)", location: "New Delhi, Delhi", type: "University", aliases: ["NSUT", "NSIT"] },
  { name: "Indraprastha Institute of Information Technology Delhi (IIIT-D)", location: "New Delhi, Delhi", type: "Institute of Technology", aliases: ["IIIT Delhi", "IIITD"] },

  // Leading Universities & Colleges in India
  { name: "University of Delhi (DU)", location: "New Delhi, Delhi", type: "University", aliases: ["DU", "Delhi University"] },
  { name: "Jawaharlal Nehru University (JNU)", location: "New Delhi, Delhi", type: "University", aliases: ["JNU"] },
  { name: "Jamia Millia Islamia", location: "New Delhi, Delhi", type: "University", aliases: ["JMI"] },
  { name: "Banaras Hindu University (BHU)", location: "Varanasi, Uttar Pradesh", type: "University", aliases: ["BHU"] },
  { name: "University of Mumbai", location: "Mumbai, Maharashtra", type: "University", aliases: ["Mumbai University", "MU"] },
  { name: "Vellore Institute of Technology (VIT)", location: "Vellore, Tamil Nadu", type: "Institute of Technology", aliases: ["VIT", "VIT Vellore"] },
  { name: "SRM Institute of Science and Technology", location: "Chennai, Tamil Nadu", type: "University", aliases: ["SRM", "SRM University"] },
  { name: "Manipal Academy of Higher Education (MAHE)", location: "Manipal, Karnataka", type: "University", aliases: ["Manipal University", "MIT Manipal"] },
  { name: "Anna University", location: "Chennai, Tamil Nadu", type: "University", aliases: ["Anna Univ"] },
  { name: "PSG College of Technology", location: "Coimbatore, Tamil Nadu", type: "College", aliases: ["PSG Tech"] },
  { name: "Jadavpur University", location: "Kolkata, West Bengal", type: "University", aliases: ["JU", "Jadavpur"] },
  { name: "Thapar Institute of Engineering and Technology", location: "Patiala, Punjab", type: "Institute of Technology", aliases: ["Thapar University"] },
  { name: "Amity University", location: "Noida, Uttar Pradesh", type: "University", aliases: ["Amity"] },
  { name: "Christ University", location: "Bangalore, Karnataka", type: "University", aliases: ["Christ College", "Christ"] },
  { name: "St. Xavier's College", location: "Mumbai, Maharashtra", type: "College", aliases: ["St Xaviers Mumbai"] },
  { name: "St. Stephen's College", location: "New Delhi, Delhi", type: "College", aliases: ["Stephens"] },
  { name: "Loyola College", location: "Chennai, Tamil Nadu", type: "College", aliases: ["Loyola Chennai"] },
  { name: "Symbiosis International University", location: "Pune, Maharashtra", type: "University", aliases: ["Symbiosis", "SIU"] },
  { name: "Chandigarh University", location: "Mohali, Punjab", type: "University", aliases: ["CU"] },
  { name: "Lovely Professional University (LPU)", location: "Phagwara, Punjab", type: "University", aliases: ["LPU"] },
  { name: "Visvesvaraya Technological University (VTU)", location: "Belagavi, Karnataka", type: "University", aliases: ["VTU"] },
  { name: "RV College of Engineering (RVCE)", location: "Bangalore, Karnataka", type: "College", aliases: ["RVCE"] },
  { name: "BMS College of Engineering", location: "Bangalore, Karnataka", type: "College", aliases: ["BMSCE"] },
  { name: "PES University", location: "Bangalore, Karnataka", type: "University", aliases: ["PESIT", "PES"] },
  { name: "College of Engineering, Pune (COEP)", location: "Pune, Maharashtra", type: "College", aliases: ["COEP"] },
  { name: "Veermata Jijabai Technological Institute (VJTI)", location: "Mumbai, Maharashtra", type: "College", aliases: ["VJTI"] },

  // International Premier Universities
  { name: "Stanford University", location: "Stanford, California, USA", type: "University", aliases: ["Stanford"] },
  { name: "Massachusetts Institute of Technology (MIT)", location: "Cambridge, Massachusetts, USA", type: "Institute of Technology", aliases: ["MIT"] },
  { name: "Harvard University", location: "Cambridge, Massachusetts, USA", type: "University", aliases: ["Harvard"] },
  { name: "University of California, Berkeley (UC Berkeley)", location: "Berkeley, California, USA", type: "University", aliases: ["UC Berkeley", "Cal"] },
  { name: "Carnegie Mellon University (CMU)", location: "Pittsburgh, Pennsylvania, USA", type: "University", aliases: ["CMU"] },
  { name: "University of Oxford", location: "Oxford, United Kingdom", type: "University", aliases: ["Oxford"] },
  { name: "University of Cambridge", location: "Cambridge, United Kingdom", type: "University", aliases: ["Cambridge"] },
  { name: "Imperial College London", location: "London, United Kingdom", type: "University", aliases: ["Imperial"] },
  { name: "National University of Singapore (NUS)", location: "Singapore", type: "University", aliases: ["NUS"] },
  { name: "Nanyang Technological University (NTU)", location: "Singapore", type: "University", aliases: ["NTU"] },
  { name: "University of Toronto", location: "Toronto, Ontario, Canada", type: "University", aliases: ["U of T"] },
  { name: "University of Waterloo", location: "Waterloo, Ontario, Canada", type: "University", aliases: ["Waterloo"] },
  { name: "Technical University of Munich (TUM)", location: "Munich, Germany", type: "University", aliases: ["TUM"] },
  { name: "ETH Zurich", location: "Zurich, Switzerland", type: "University", aliases: ["ETH"] },
  { name: "University of Melbourne", location: "Melbourne, Australia", type: "University", aliases: ["UniMelb"] },
];

export function searchInstitutions(query: string, limit = 8): Institution[] {
  const q = query.trim().toLowerCase();
  if (!q) return curatedInstitutions.slice(0, limit);

  return curatedInstitutions
    .filter((inst) => {
      if (inst.name.toLowerCase().includes(q)) return true;
      if (inst.location.toLowerCase().includes(q)) return true;
      return inst.aliases.some((alias) => alias.toLowerCase().includes(q));
    })
    .slice(0, limit);
}

