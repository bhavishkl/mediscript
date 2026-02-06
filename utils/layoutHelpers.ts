import { DischargeData, InvestigationEntry } from '../types';

export const getLayoutSplit = (data: DischargeData) => {
  // Group investigations by category
  const groupedInvestigations: Record<string, InvestigationEntry[]> = {};
  data.investigations.forEach(inv => {
    const cat = inv.category?.trim().toUpperCase() || 'OTHERS';
    if (!groupedInvestigations[cat]) groupedInvestigations[cat] = [];
    groupedInvestigations[cat].push(inv);
  });

  let currentLineCount = 0;

  // Estimate lines from Diagnosis and Presentation
  // We approximate that one line is about 90 characters for full width text areas
  const countEstimatedLines = (text: string) => {
    if (!text) return 1;
    const explicitLines = text.split('\n');
    return explicitLines.reduce((acc, line) => {
      // Assume roughly 90 chars per line (conservative)
      const wrappedLines = Math.max(1, Math.ceil(line.length / 90));
      return acc + wrappedLines;
    }, 0);
  };

  const diagnosisLines = countEstimatedLines(data.finalDiagnosis);
  const presentationLines = countEstimatedLines(data.clinicalPresentation);

  // Adjust max lines based on content above
  // If diagnosis/presentation are long, we have less space.
  const page1Groups: Record<string, InvestigationEntry[]> = {};
  const page2Groups: Record<string, InvestigationEntry[]> = {};

  let isPage1Full = false;
  // We deduct lines used by text fields from the budget
  // Assuming each text line consumes same height as investigation row for simplicity
  let availableLines = 22 - (diagnosisLines + presentationLines);
  if (availableLines < 5) availableLines = 5; // Ensure at least some space

  Object.entries(groupedInvestigations).forEach(([category, items]) => {
    if (isPage1Full) {
      page2Groups[category] = items;
      return;
    }

    // Check if category header fits
    if (currentLineCount + 1 > availableLines) {
       isPage1Full = true;
       page2Groups[category] = items;
       return;
    }

    // Category header takes 1 line
    currentLineCount += 1;

    // Now check items
    const page1Items: InvestigationEntry[] = [];
    const page2Items: InvestigationEntry[] = [];

    items.forEach(item => {
      if (isPage1Full) {
        page2Items.push(item);
      } else {
         if (currentLineCount + 1 <= availableLines) {
           page1Items.push(item);
           currentLineCount += 1;
         } else {
           isPage1Full = true;
           page2Items.push(item);
         }
      }
    });

    if (page1Items.length > 0) {
      page1Groups[category] = page1Items;
    }

    if (page2Items.length > 0) {
      page2Groups[category] = page2Items;
    }
  });

  return {
    investigationsPage1: page1Groups,
    investigationsPage2: page2Groups,
    groupedInvestigations
  };
};
