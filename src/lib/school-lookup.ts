// School lookup and Parchment network verification
export interface SchoolInfo {
  name: string;
  ceebCode: string;
  city?: string;
  state?: string;
  inParchmentNetwork: boolean;
  alternativeDeliveryMethods?: string[];
}

// This would be populated from Parchment Member Directory API in production
const PARCHMENT_MEMBER_SCHOOLS: SchoolInfo[] = [
  // Sample data - in production, this would come from Parchment's Member Directory API
  {
    name: "University of California, Los Angeles",
    ceebCode: "4837",
    city: "Los Angeles", 
    state: "CA",
    inParchmentNetwork: true
  },
  {
    name: "Harvard University",
    ceebCode: "3434",
    city: "Cambridge",
    state: "MA", 
    inParchmentNetwork: true
  },
  // Add more schools as needed
];

export async function lookupSchoolByCeeb(ceebCode: string): Promise<SchoolInfo | null> {
  // In production, this would query Parchment's Member Directory API
  const school = PARCHMENT_MEMBER_SCHOOLS.find(s => s.ceebCode === ceebCode);
  return school || null;
}

export async function searchSchoolsByName(query: string): Promise<SchoolInfo[]> {
  const normalizedQuery = query.toLowerCase();
  return PARCHMENT_MEMBER_SCHOOLS.filter(school =>
    school.name.toLowerCase().includes(normalizedQuery)
  );
}

export function determineProcessingMethod(sourceSchool: SchoolInfo | null, destinationSchool: SchoolInfo | null): {
  method: 'PARCHMENT' | 'MANUAL' | 'HYBRID';
  description: string;
  estimatedTime: string;
} {
  if (sourceSchool?.inParchmentNetwork && destinationSchool?.inParchmentNetwork) {
    return {
      method: 'PARCHMENT',
      description: 'Electronic processing through Parchment network',
      estimatedTime: '1-3 business days'
    };
  } else if (!sourceSchool?.inParchmentNetwork && destinationSchool?.inParchmentNetwork) {
    return {
      method: 'HYBRID',
      description: 'Manual verification with electronic delivery',
      estimatedTime: '3-7 business days'
    };
  } else {
    return {
      method: 'MANUAL',
      description: 'Traditional mail processing with verification',
      estimatedTime: '7-14 business days'
    };
  }
}

export function getProcessingInstructions(method: string): string[] {
  switch (method) {
    case 'PARCHMENT':
      return [
        'Your request will be processed electronically through the Parchment network',
        'Both your school and destination institution participate in electronic transcripts',
        'You will not receive a confirmation email, but the institution will be notified',
        'Processing typically takes 1-3 business days'
      ];
    case 'HYBRID':
      return [
        'Your source school will be contacted to verify your request',
        'Once verified, your transcript will be sent electronically to the destination',
        'You may receive verification requests via email',
        'Processing typically takes 3-7 business days'
      ];
    case 'MANUAL':
      return [
        'Both institutions will be contacted to arrange traditional transcript delivery',
        'This may involve physical mail or fax delivery methods',
        'Additional verification steps may be required',
        'Processing typically takes 7-14 business days',
        'You may need to follow up directly with your school\'s registrar office'
      ];
    default:
      return ['Processing method to be determined based on institutional capabilities'];
  }
}