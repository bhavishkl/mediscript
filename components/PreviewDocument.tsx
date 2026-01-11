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

  return (
    <div ref={ref} className="bg-white text-black p-8 max-w-[210mm] mx-auto min-h-[297mm] shadow-lg print-area text-base leading-relaxed box-border">

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

        {/* Investigations - Table Format */}
        {data.investigations.length > 0 && (
          <section>
            <h2 className="font-bold uppercase text-base mb-2 underline">Investigations:</h2>
            <div className="w-full border border-black text-base">
              {Object.entries(groupedInvestigations).map(([category, items]: [string, InvestigationEntry[]], catIndex) => (
                <React.Fragment key={category}>
                  {/* Category Header */}
                  <div className={`font-bold p-1 bg-gray-100 uppercase border-b border-black ${catIndex > 0 ? '' : ''}`}>
                    {category}
                  </div>
                  {/* Items */}
                  {items.map((item, index) => (
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
          </section>
        )}

        {/* Treatment Given - Table Format */}
        {data.treatmentGiven.length > 0 && (
          <section className="mt-8">
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
  );
});

PreviewDocument.displayName = 'PreviewDocument';