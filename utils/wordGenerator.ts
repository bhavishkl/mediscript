import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, BorderStyle, HeadingLevel, PageBreak, AlignmentType } from "docx";
import { saveAs } from "file-saver";
import { DischargeData, InvestigationEntry } from "../types";
import { getLayoutSplit } from "./layoutHelpers";

export const generateWordDocument = async (data: DischargeData) => {
  const { investigationsPage1, investigationsPage2 } = getLayoutSplit(data);

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
  };

  // Helper to create borders
  const blackBorder = { style: BorderStyle.SINGLE, size: 1, color: "000000" };
  const allBorders = { top: blackBorder, bottom: blackBorder, left: blackBorder, right: blackBorder };

  // Patient Info Table
  const patientInfoTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: "NAME: ", bold: true }), new TextRun(data.patientName)] })],
            borders: allBorders,
          }),
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: "DOA: ", bold: true }), new TextRun(formatDate(data.admissionDate))] })],
            borders: allBorders,
          }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: "AGE: ", bold: true }), new TextRun(`${data.age} ${data.gender ? '/' + data.gender.toLowerCase() : ''}`)] })],
            borders: allBorders,
          }),
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: "DOD: ", bold: true }), new TextRun(formatDate(data.dischargeDate))] })],
            borders: allBorders,
          }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: "IP NO: ", bold: true }), new TextRun(data.ipNo)] })],
            borders: allBorders,
          }),
          new TableCell({
             children: [],
             borders: allBorders,
          }),
        ],
      }),
    ],
  });

  const createSectionHeader = (text: string) => new Paragraph({
    children: [new TextRun({ text: text, bold: true, underline: { type: "single" } })],
    spacing: { before: 200, after: 100 },
  });

  const createTextContent = (text: string) => new Paragraph({
    children: [new TextRun(text || "")],
  });

  const createInvestigationsTable = (groups: Record<string, InvestigationEntry[]>) => {
    const rows: TableRow[] = [];
    Object.entries(groups).forEach(([category, items]) => {
      // Header Row
      rows.push(
        new TableRow({
          children: [
             new TableCell({
               children: [new Paragraph({ children: [new TextRun({ text: category, bold: true })] })],
               columnSpan: 2,
               shading: { fill: "F3F4F6" }, // Light gray
               borders: allBorders
             })
          ]
        })
      );
      // Items
      items.forEach(item => {
        rows.push(
          new TableRow({
            children: [
              new TableCell({
                children: [new Paragraph(formatDate(item.date))],
                width: { size: 25, type: WidthType.PERCENTAGE },
                borders: allBorders
              }),
              new TableCell({
                 children: [new Paragraph({
                    children: [
                        new TextRun({ text: item.name, bold: true }),
                        new TextRun(item.name && item.result ? " - " : ""),
                        new TextRun(item.result)
                    ]
                 })],
                 width: { size: 75, type: WidthType.PERCENTAGE },
                 borders: allBorders
              })
            ]
          })
        );
      });
    });

    return new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: rows,
    });
  };

  // Treatment Table
  const treatmentPairs = [];
  for (let i = 0; i < data.treatmentGiven.length; i += 2) {
      treatmentPairs.push([data.treatmentGiven[i], data.treatmentGiven[i + 1] || null]);
  }

  const treatmentTable = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: treatmentPairs.map(pair => new TableRow({
          children: [
              new TableCell({
                  children: [new Paragraph({
                      children: [
                          new TextRun({ text: pair[0].name, bold: true }),
                          new TextRun({ text: pair[0].dosage ? ` ${pair[0].dosage}` : "", color: "4B5563" })
                      ]
                  })],
                  borders: allBorders,
                  width: { size: 50, type: WidthType.PERCENTAGE }
              }),
              new TableCell({
                  children: pair[1] ? [new Paragraph({
                      children: [
                          new TextRun({ text: pair[1].name, bold: true }),
                          new TextRun({ text: pair[1].dosage ? ` ${pair[1].dosage}` : "", color: "4B5563" })
                      ]
                  })] : [],
                  borders: allBorders,
                  width: { size: 50, type: WidthType.PERCENTAGE }
              })
          ]
      }))
  });


  // Build Page 1 Content
  const page1Children = [
      new Paragraph({
          text: "DISCHARGE SUMMARY",
          heading: HeadingLevel.HEADING_1,
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 }
      }),
      ...(data.dischargeAgainstMedicalAdvice ? [
          new Paragraph({
              text: "DISCHARGE AGAINST MEDICAL ADVICE",
              alignment: AlignmentType.CENTER,
              shading: { fill: "FDE047" }, // Yellow
              spacing: { after: 200 }
          })
      ] : []),
      patientInfoTable,
      createSectionHeader("FINAL DIAGNOSIS:"),
      createTextContent(data.finalDiagnosis),
      createSectionHeader("CLINICAL PRESENTATION:"),
      createTextContent(data.clinicalPresentation),
  ];

  if (Object.keys(investigationsPage1).length > 0) {
      page1Children.push(createSectionHeader("INVESTIGATIONS:"));
      page1Children.push(createInvestigationsTable(investigationsPage1));
  }

  // Page 2 Content
  const page2Content = [];

  // Explicit Page Break
  page2Content.push(new Paragraph({ children: [new PageBreak()] }));

  if (Object.keys(investigationsPage2).length > 0) {
      page2Content.push(createSectionHeader("INVESTIGATIONS (Continued):"));
      page2Content.push(createInvestigationsTable(investigationsPage2));
  }

  if (data.treatmentGiven.length > 0) {
      page2Content.push(createSectionHeader("TREATMENT GIVEN:"));
      page2Content.push(treatmentTable);
  }

  // Course
  page2Content.push(createSectionHeader("COURSE IN THE HOSPITAL/SURGICAL PROCEDURE:"));
  page2Content.push(new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [new TableRow({ children: [new TableCell({ children: [new Paragraph(data.hospitalCourse)], borders: allBorders })] })]
  }));

  // Discharge Advice
  page2Content.push(createSectionHeader("ADVISE ON DISCHARGE:"));
  page2Content.push(new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [new TableRow({ children: [new TableCell({ children: [new Paragraph(data.dischargeAdvice)], borders: allBorders })] })]
  }));

  // Follow Up
  page2Content.push(createSectionHeader("NEXT FOLLOW UP :"));
  page2Content.push(new Table({
      width: { size: 50, type: WidthType.PERCENTAGE }, // Half width
      rows: [new TableRow({ children: [new TableCell({ children: [new Paragraph(data.followUp)], borders: allBorders })] })]
  }));

  // Signature
  page2Content.push(new Paragraph({
      text: "Consultant Name and Signature",
      alignment: AlignmentType.RIGHT,
      spacing: { before: 800 } // Space for signature
  }));


  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
            ...page1Children,
            ...page2Content
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${data.patientName || 'Patient'}_Discharge_Summary.docx`);
};
