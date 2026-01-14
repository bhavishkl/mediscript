import React, { forwardRef, useMemo } from 'react';
import { DischargeData, InvestigationEntry } from '../types';

interface PreviewDocumentProps {
  data: DischargeData;
}

// Using forwardRef to allow the parent to target this component for PDF generation
export const PreviewDocument = forwardRef<HTMLDivElement, PreviewDocumentProps>(({ data }, ref) => {

  // Helper to format dates to DD/MM/YYYY
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
  };

  // Group investigations by category
  const groupedInvestigations = useMemo(() => {
    const groups: Record<string, InvestigationEntry[]> = {};
    data.investigations.forEach(inv => {
      const cat = inv.category?.trim().toUpperCase() || 'OTHERS';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(inv);
    });
    return groups;
  }, [data.investigations]);

  // Helper for Treatment Pairs to render two columns
  const treatmentPairs = useMemo(() => {
    const pairs = [];
    for (let i = 0; i < data.treatmentGiven.length; i += 2) {
      pairs.push([data.treatmentGiven[i], data.treatmentGiven[i + 1] || null]);
    }
    return pairs;
  }, [data.treatmentGiven]);

  // Logic to split investigations between Page 1 and Page 2
  // We approximate the number of lines available on Page 1.
  // Header ~ 50mm
  // Patient Info ~ 40mm
  // Diagnosis + Clinical Presentation ~ Variable, let's assume 5-6 lines each = ~40mm
  // Total used: ~130mm
  // Available for investigations: 297mm - 130mm - 20mm (margins) = ~147mm
  // Each investigation row ~ 7-8mm
  // Max rows ~ 18-20 lines.

  const { investigationsPage1, investigationsPage2 } = useMemo(() => {
    const MAX_LINES_PAGE_1 = 15; // Conservative limit
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
    // Let's say we have a fixed budget of "slots" for the bottom half.
    // If we assume the top half is fixed, we have the bottom half.
    // Let's use a simpler approach: fixed number of investigation items + headers.

    const page1Groups: Record<string, InvestigationEntry[]> = {};
    const page2Groups: Record<string, InvestigationEntry[]> = {};

    let isPage1Full = false;
    // We deduct lines used by text fields from the budget
    // Assuming each text line consumes same height as investigation row for simplicity
    let availableLines = 22 - (diagnosisLines + presentationLines);
    if (availableLines < 5) availableLines = 5; // Ensure at least some space or just flow to next page?

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
        // If we split a category, we might want to repeat header or just list items?
        // User said "create new table", so repeated header or just continue is fine.
        // If we put it in page2Groups, our renderer handles it by creating a header.
        // But if page1Items was empty, we already handled it.
        // If page1Items has some, and page2Items has some, we add page2Items to page2Groups
        // which will render a header again on Page 2. This is good practice.
        page2Groups[category] = page2Items;
      }
    });

    return { investigationsPage1: page1Groups, investigationsPage2: page2Groups };
  }, [groupedInvestigations, data.finalDiagnosis, data.clinicalPresentation]);


  const renderInvestigations = (groups: Record<string, InvestigationEntry[]>) => {
    return (
      <div className="w-full border border-black text-base">
        {Object.entries(groups).map(([category, items], catIndex) => (
          <React.Fragment key={category}>
            {/* Category Header */}
            <div className={`font-bold p-1 bg-gray-100 uppercase border-b border-black`}>
              {category}
            </div>
            {/* Items */}
            {items.map((item) => (
              <div key={item.id} className="flex border-b border-black last:border-b-0">
                {/* Date Column */}
                <div className="w-28 p-1 border-r border-black flex-shrink-0">
                  {formatDate(item.date)}
                </div>
                {/* Description Column */}
                <div className="flex-1 p-1">
                  <span className="font-semibold">{item.name}</span>
                  {item.name && item.result && <span> - </span>}
                  <span>{item.result}</span>
                </div>
              </div>
            ))}
          </React.Fragment>
        ))}
      </div>
    );
  };

  return (
    <div ref={ref} className="bg-gray-100 print:bg-white text-black font-sans">

      {/* First Page */}
      <div className="a4-page bg-white shadow-lg mx-auto print:shadow-none mb-8 print:mb-0 relative">

        {/* Header Section */}
        <div className="flex flex-col mt-14 mb-2">
          <h1 className="text-xl font-bold text-center uppercase tracking-wide mt-2 mb-2 underline decoration-2 underline-offset-4">
            Discharge Summary
          </h1>

          {/* Discharge Against Medical Advice Warning */}
          {data.dischargeAgainstMedicalAdvice && (
            <div className="bg-yellow-300 text-center">
              <h2 className="text-l font-bold uppercase tracking-wide underline decoration-2 underline-offset-4">
                Discharge Against Medical Advice
              </h2>
            </div>
          )}
        </div>

        {/* Patient Info Table - Exact replication of borders */}
        <div className="border border-black mb-8">
          <div className="flex border-b border-black">
            <div className="flex-1 p-2 border-r border-black font-bold text-base">
              NAME: <span className="font-normal ml-2">{data.patientName}</span>
            </div>
            <div className="flex-1 p-2 font-bold text-base">
              DOA: <span className="font-normal ml-2">{formatDate(data.admissionDate)}</span>
            </div>
          </div>
          <div className="flex border-b border-black">
            <div className="flex-1 p-2 border-r border-black font-bold text-base">
              AGE: <span className="font-normal ml-2">{data.age} {data.gender ? `/${data.gender.toLowerCase()}` : ''}</span>
            </div>
            <div className="flex-1 p-2 font-bold text-base">
              DOD: <span className="font-normal ml-2">{formatDate(data.dischargeDate)}</span>
            </div>
          </div>
          <div className="flex">
            <div className="flex-1 p-2 border-r border-black font-bold text-base">
              IP NO: <span className="font-normal ml-2">{data.ipNo}</span>
            </div>
            <div className="flex-1 p-2">
              {/* Empty cell as per image */}
            </div>
          </div>
        </div>

        {/* Medical Content */}
        <div className="space-y-6">

          {/* Final Diagnosis */}
          <section>
            <h2 className="font-bold uppercase text-base mb-2 underline">Final Diagnosis:</h2>
            <div className="whitespace-pre-line pl-1">{data.finalDiagnosis}</div>
          </section>

          {/* Clinical Presentation */}
          <section>
            <h2 className="font-bold uppercase text-base mb-2 underline">Clinical Presentation:</h2>
            <div className="whitespace-pre-line pl-1">{data.clinicalPresentation}</div>
          </section>

          {/* Investigations - Page 1 Part */}
          {Object.keys(investigationsPage1).length > 0 && (
            <section>
              <h2 className="font-bold uppercase text-base mb-2 underline">Investigations:</h2>
              {renderInvestigations(investigationsPage1)}
            </section>
          )}
        </div>
      </div>

      {/* Second Page */}
      <div className="a4-page bg-white shadow-lg mx-auto print:shadow-none relative page-break">

         {/* Overflow Investigations */}
         {Object.keys(investigationsPage2).length > 0 && (
            <section className="mb-6">
              <h2 className="font-bold uppercase text-base mb-2 underline">Investigations (Continued):</h2>
              {renderInvestigations(investigationsPage2)}
            </section>
         )}

         {/* Treatment Given - Table Format */}
         {data.treatmentGiven.length > 0 && (
          <section>
            <h2 className="font-bold uppercase text-base mb-2 underline">Treatment Given:</h2>
            <div className="border border-black text-base">
              {treatmentPairs.map((pair, index) => (
                <div key={index} className="flex border-b border-black last:border-b-0">
                  {/* Column 1 */}
                  <div className="flex-1 p-1 border-r border-black">
                    <span className="font-medium">{pair[0].name}</span>
                    {pair[0].dosage && <span className="ml-1 text-gray-800">{pair[0].dosage}</span>}
                  </div>
                  {/* Column 2 */}
                  <div className="flex-1 p-1">
                    {pair[1] && (
                      <>
                        <span className="font-medium">{pair[1].name}</span>
                        {pair[1].dosage && <span className="ml-1 text-gray-800">{pair[1].dosage}</span>}
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="space-y-6 mt-6">
          {/* Course in Hospital - Boxed */}
          <section className="border border-black p-3">
            <h2 className="font-bold uppercase text-base mb-4 underline">Course in the Hospital/Surgical Procedure:</h2>
            <div className="whitespace-pre-line min-h-[4rem]">{data.hospitalCourse}</div>
          </section>

          {/* Discharge Advice - Boxed */}
          <section className="border border-black p-3">
            <h2 className="font-bold uppercase text-base mb-4 underline">Advise on Discharge:</h2>
            <div className="whitespace-pre-line min-h-[4rem]">{data.dischargeAdvice}</div>
          </section>

          {/* Follow Up - Boxed */}
          <section className="border border-black p-3 w-1/2">
            <h2 className="font-bold uppercase text-base mb-4 underline">Next Follow Up :</h2>
            <div className="whitespace-pre-line uppercase min-h-[2rem]">{data.followUp}</div>
          </section>

          {/* Signature */}
          <div className="flex justify-end pt-16 pb-4">
            <div className="text-right">
              <p className="font-bold underline uppercase text-base">Consultant Name and Signature</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

PreviewDocument.displayName = 'PreviewDocument';
