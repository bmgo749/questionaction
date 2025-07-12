// Category keywords for verification - no external import needed

interface CategoryKeywords {
  [key: string]: string[];
}

// Define keywords for each category to help with automatic categorization
const categoryKeywords: CategoryKeywords = {
  world: ['global', 'international', 'country', 'nation', 'world', 'earth', 'continent', 'global affairs', 'diplomacy', 'foreign policy'],
  history: ['historical', 'ancient', 'medieval', 'war', 'battle', 'empire', 'civilization', 'past', 'century', 'era', 'timeline', 'artifact'],
  science: ['research', 'experiment', 'laboratory', 'scientific', 'theory', 'hypothesis', 'discovery', 'innovation', 'biology', 'chemistry', 'physics'],
  geography: ['mountain', 'river', 'ocean', 'city', 'capital', 'continent', 'climate', 'terrain', 'location', 'region', 'landscape'],
  sports: ['game', 'team', 'player', 'athlete', 'competition', 'tournament', 'championship', 'match', 'score', 'football', 'basketball', 'soccer'],
  entertainment: ['movie', 'film', 'music', 'song', 'celebrity', 'actor', 'director', 'show', 'concert', 'album', 'performance'],
  politics: ['government', 'election', 'policy', 'politician', 'democracy', 'parliament', 'president', 'minister', 'vote', 'law', 'constitution'],
  technology: ['computer', 'software', 'hardware', 'digital', 'internet', 'programming', 'artificial intelligence', 'robot', 'innovation', 'tech'],
  health: ['medical', 'doctor', 'hospital', 'medicine', 'disease', 'treatment', 'health', 'wellness', 'patient', 'surgery', 'therapy'],
  education: ['school', 'university', 'student', 'teacher', 'learning', 'education', 'academic', 'course', 'degree', 'knowledge'],
  astronomy: ['space', 'planet', 'star', 'galaxy', 'universe', 'solar system', 'astronaut', 'telescope', 'nasa', 'cosmos', 'satellite', 'moon', 'sun', 'asteroid', 'comet', 'black hole', 'spacecraft', 'orbital', 'celestial', 'astronomy', 'astrophysics']
};

/**
 * Analyzes article content and suggests the most appropriate category
 * @param title - Article title
 * @param content - Article content
 * @param selectedCategories - Categories selected by user
 * @returns Object with suggested category and verification result
 */
export function verifyAndSuggestCategory(
  title: string, 
  content: string, 
  selectedCategories: string[]
): { 
  suggestedCategory: string | null; 
  isVerified: boolean; 
  confidence: number;
  reason: string;
} {
  const combinedText = `${title.toLowerCase()} ${content.toLowerCase()}`;
  
  // Calculate scores for each category based on keyword matches
  const categoryScores: { [key: string]: number } = {};
  
  Object.entries(categoryKeywords).forEach(([category, keywords]) => {
    let score = 0;
    keywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword.toLowerCase()}\\b`, 'g');
      const matches = combinedText.match(regex);
      if (matches) {
        score += matches.length;
      }
    });
    categoryScores[category] = score;
  });
  
  // Find the category with highest score
  const sortedCategories = Object.entries(categoryScores)
    .sort(([,a], [,b]) => b - a)
    .filter(([,score]) => score > 0);
  
  if (sortedCategories.length === 0) {
    return {
      suggestedCategory: null,
      isVerified: true, // If no keywords match, accept user's choice
      confidence: 0,
      reason: 'No specific category keywords found. User selection accepted.'
    };
  }
  
  const [topCategory, topScore] = sortedCategories[0];
  const confidence = Math.min((topScore / 10) * 100, 100); // Scale confidence to percentage
  
  // Check if user's first selected category matches the suggested category
  const userPrimaryCategory = selectedCategories[0];
  const isVerified = userPrimaryCategory === topCategory || confidence < 30;
  
  let reason = '';
  if (isVerified && userPrimaryCategory === topCategory) {
    reason = `Category "${topCategory}" matches content analysis (${topScore} relevant keywords found).`;
  } else if (isVerified && confidence < 30) {
    reason = 'Low confidence in category detection. User selection accepted.';
  } else {
    reason = `Content suggests "${topCategory}" category (${topScore} keywords) but user selected "${userPrimaryCategory}".`;
  }
  
  return {
    suggestedCategory: topCategory,
    isVerified,
    confidence,
    reason
  };
}

/**
 * Auto-corrects category selection based on content analysis
 * @param title - Article title
 * @param content - Article content
 * @param selectedCategories - Categories selected by user
 * @returns Corrected categories array
 */
export function autoCorrectCategories(
  title: string,
  content: string,
  selectedCategories: string[]
): { 
  correctedCategories: string[];
  wasChanged: boolean;
  explanation: string;
} {
  const verification = verifyAndSuggestCategory(title, content, selectedCategories);
  
  if (!verification.isVerified && verification.suggestedCategory && verification.confidence >= 50) {
    // High confidence mismatch - auto-correct the primary category
    const correctedCategories = [
      verification.suggestedCategory,
      ...selectedCategories.slice(1).filter(cat => cat !== verification.suggestedCategory)
    ];
    
    return {
      correctedCategories,
      wasChanged: true,
      explanation: `Primary category changed from "${selectedCategories[0]}" to "${verification.suggestedCategory}" based on content analysis (${verification.confidence.toFixed(0)}% confidence).`
    };
  }
  
  return {
    correctedCategories: selectedCategories,
    wasChanged: false,
    explanation: verification.reason
  };
}