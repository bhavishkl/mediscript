import React from 'react';
import { DischargeData, InvestigationEntry, TreatmentEntry } from '../types';
import { Upload, X, FileText, Activity, Pill, CalendarClock, ClipboardList, Plus, Trash2 } from 'lucide-react';

interface EditorFormProps {
  data: DischargeData;
  onChange: (newData: DischargeData) => void;
}

export const EditorForm: React.FC<EditorFormProps> = ({ data, onChange }) => {
  
  const handleChange = (field: keyof DischargeData, value: any) => {
    onChange({ ...data, [field]: value });
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleChange('logoBase64', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // --- Investigation Handlers ---
  const addInvestigation = () => {
    const newInv: InvestigationEntry = {
      id: Date.now().toString() + Math.random(),
      date: new Date().toISOString().split('T')[0],
      category: '',
      name: '',
      result: ''
    };
    handleChange('investigations', [...data.investigations, newInv]);
  };

  const removeInvestigation = (id: string) => {
    handleChange('investigations', data.investigations.filter(i => i.id !== id));
  };

  const updateInvestigation = (id: string, field: keyof InvestigationEntry, value: string) => {
    handleChange('investigations', data.investigations.map(i => 
      i.id === id ? { ...i, [field]: value } : i
    ));
  };

  // --- Treatment Handlers ---
  const addTreatment = () => {
    const newTx: TreatmentEntry = {
      id: Date.now().toString() + Math.random(),
      name: '',
      dosage: ''
    };
    handleChange('treatmentGiven', [...data.treatmentGiven, newTx]);
  };

  const removeTreatment = (id: string) => {
    handleChange('treatmentGiven', data.treatmentGiven.filter(t => t.id !== id));
  };

  const updateTreatment = (id: string, field: keyof TreatmentEntry, value: string) => {
    handleChange('treatmentGiven', data.treatmentGiven.map(t => 
      t.id === id ? { ...t, [field]: value } : t
    ));
  };

  return (
    <div className="bg-white shadow-lg rounded-lg p-6 space-y-8">
      
      {/* Branding Section */}
      <section className="border-b pb-6">
        <h2 className="text-lg font-semibold flex items-center gap-2 mb-4 text-gray-700">
          <FileText size={20} /> Hospital Branding
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hospital Logo</label>
            <div className="flex items-center gap-4">
              <label className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer">
                <Upload size={16} className="mr-2" />
                Upload Logo
                <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
              </label>
              {data.logoBase64 && (
                <div className="relative group">
                  <img src={data.logoBase64} alt="Preview" className="h-10 w-auto object-contain border rounded" />
                  <button 
                    onClick={() => handleChange('logoBase64', null)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={12} />
                  </button>
                </div>
              )}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hospital Name (Fallback)</label>
            <input
              type="text"
              className="w-full rounded-md border-gray-300 border p-2 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
              value={data.hospitalName}
              onChange={(e) => handleChange('hospitalName', e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* Patient Details */}
      <section className="border-b pb-6">
        <h2 className="text-lg font-semibold flex items-center gap-2 mb-4 text-gray-700">
          <ClipboardList size={20} /> Patient Details
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Patient Name</label>
            <input
              type="text"
              className="w-full rounded-md border-gray-300 border p-2 focus:ring-2 focus:ring-teal-500 outline-none"
              value={data.patientName}
              onChange={(e) => handleChange('patientName', e.target.value)}
              placeholder="e.g. Mr. John Doe"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
            <input
              type="text"
              className="w-full rounded-md border-gray-300 border p-2 focus:ring-2 focus:ring-teal-500 outline-none"
              value={data.age}
              onChange={(e) => handleChange('age', e.target.value)}
              placeholder="e.g. 60 Years"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
            <select
              className="w-full rounded-md border-gray-300 border p-2 focus:ring-2 focus:ring-teal-500 outline-none"
              value={data.gender}
              onChange={(e) => handleChange('gender', e.target.value)}
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Inpatient No. (IP NO)</label>
            <input
              type="text"
              className="w-full rounded-md border-gray-300 border p-2 focus:ring-2 focus:ring-teal-500 outline-none"
              value={data.ipNo}
              onChange={(e) => handleChange('ipNo', e.target.value)}
              placeholder="2025/1234"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Admission (DOA)</label>
              <input
                type="date"
                className="w-full rounded-md border-gray-300 border p-2 focus:ring-2 focus:ring-teal-500 outline-none"
                value={data.admissionDate}
                onChange={(e) => handleChange('admissionDate', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Discharge (DOD)</label>
              <input
                type="date"
                className="w-full rounded-md border-gray-300 border p-2 focus:ring-2 focus:ring-teal-500 outline-none"
                value={data.dischargeDate}
                onChange={(e) => handleChange('dischargeDate', e.target.value)}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Clinical Info */}
      <section className="border-b pb-6">
        <h2 className="text-lg font-semibold flex items-center gap-2 mb-4 text-gray-700">
          <Activity size={20} /> Clinical Information
        </h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Final Diagnosis</label>
            <textarea
              rows={2}
              className="w-full rounded-md border-gray-300 border p-2 focus:ring-2 focus:ring-teal-500 outline-none"
              value={data.finalDiagnosis}
              onChange={(e) => handleChange('finalDiagnosis', e.target.value)}
              placeholder="1) Diagnosis A&#10;2) Diagnosis B"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Clinical Presentation</label>
            <textarea
              rows={3}
              className="w-full rounded-md border-gray-300 border p-2 focus:ring-2 focus:ring-teal-500 outline-none"
              value={data.clinicalPresentation}
              onChange={(e) => handleChange('clinicalPresentation', e.target.value)}
              placeholder="Patient presented with..."
            />
          </div>
        </div>
      </section>

      {/* Investigations - Dynamic Inputs */}
      <section className="border-b pb-6">
        <h2 className="text-lg font-semibold flex items-center gap-2 mb-4 text-gray-700">
          <Activity size={20} /> Investigations
        </h2>
        
        <div className="space-y-4">
          {data.investigations.map((inv) => (
            <div key={inv.id} className="p-4 bg-gray-50 border border-gray-200 rounded-md">
              <div className="space-y-2">
                <input
                  type="text"
                  className="w-full rounded border-gray-300 border p-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                  placeholder="Category (e.g., RADIOLOGY)"
                  value={inv.category}
                  onChange={(e) => updateInvestigation(inv.id, 'category', e.target.value)}
                />
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                   <input
                    type="date"
                    className="w-full rounded border-gray-300 border p-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                    value={inv.date}
                    onChange={(e) => updateInvestigation(inv.id, 'date', e.target.value)}
                  />
                   <input
                    type="text"
                    className="w-full sm:col-span-2 rounded border-gray-300 border p-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                    placeholder="Investigation Name (e.g., CXR)"
                    value={inv.name}
                    onChange={(e) => updateInvestigation(inv.id, 'name', e.target.value)}
                  />
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    className="flex-1 rounded border-gray-300 border p-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                    placeholder="Investigation Result"
                    value={inv.result}
                    onChange={(e) => updateInvestigation(inv.id, 'result', e.target.value)}
                  />
                  <button
                    onClick={() => removeInvestigation(inv.id)}
                    className="bg-red-500 hover:bg-red-600 text-white p-2 rounded transition-colors flex-shrink-0"
                    title="Remove Investigation"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}

          <button
            onClick={addInvestigation}
            className="flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-md font-medium transition-colors w-full sm:w-auto"
          >
            <Plus size={18} /> Add Investigation
          </button>
        </div>
      </section>

      {/* Treatment Given - Dynamic Inputs */}
      <section className="border-b pb-6">
        <h2 className="text-lg font-semibold flex items-center gap-2 mb-4 text-gray-700">
          <Pill size={20} /> Treatment Given
        </h2>
        <div className="space-y-4">
          
          {data.treatmentGiven.map((tx) => (
            <div key={tx.id} className="p-4 bg-gray-50 border border-gray-200 rounded-md">
              <div className="space-y-2">
                <input
                  type="text"
                  className="w-full rounded border-gray-300 border p-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                  placeholder="Treatment/Medicine Name"
                  value={tx.name}
                  onChange={(e) => updateTreatment(tx.id, 'name', e.target.value)}
                />
                <div className="flex gap-2">
                  <input
                    type="text"
                    className="flex-1 rounded border-gray-300 border p-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                    placeholder="Dosage/Frequency"
                    value={tx.dosage}
                    onChange={(e) => updateTreatment(tx.id, 'dosage', e.target.value)}
                  />
                  <button
                    onClick={() => removeTreatment(tx.id)}
                    className="bg-red-500 hover:bg-red-600 text-white p-2 rounded transition-colors flex-shrink-0"
                    title="Remove Treatment"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}

          <button
            onClick={addTreatment}
            className="flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-md font-medium transition-colors w-full sm:w-auto"
          >
            <Plus size={18} /> Add Treatment
          </button>
        </div>
      </section>

      {/* Course in Hospital */}
      <section className="border-b pb-6">
        <h2 className="text-lg font-semibold flex items-center gap-2 mb-4 text-gray-700">
          <Activity size={20} /> Course in Hospital
        </h2>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Course in Hospital / Procedure</label>
          <textarea
            rows={4}
            className="w-full rounded-md border-gray-300 border p-2 focus:ring-2 focus:ring-teal-500 outline-none"
            value={data.hospitalCourse}
            onChange={(e) => handleChange('hospitalCourse', e.target.value)}
            placeholder="Patient was admitted..."
          />
        </div>
      </section>

      {/* Discharge & Follow Up */}
      <section>
        <h2 className="text-lg font-semibold flex items-center gap-2 mb-4 text-gray-700">
          <CalendarClock size={20} /> Plan
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Advice on Discharge</label>
            <textarea
              rows={3}
              className="w-full rounded-md border-gray-300 border p-2 focus:ring-2 focus:ring-teal-500 outline-none"
              value={data.dischargeAdvice}
              onChange={(e) => handleChange('dischargeAdvice', e.target.value)}
              placeholder="To continue same medication..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Next Follow Up</label>
            <input
              type="text"
              className="w-full rounded-md border-gray-300 border p-2 focus:ring-2 focus:ring-teal-500 outline-none"
              value={data.followUp}
              onChange={(e) => handleChange('followUp', e.target.value)}
              placeholder="Review after 7 days"
            />
          </div>
        </div>
      </section>
    </div>
  );
};