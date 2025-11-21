import React, { useState } from 'react';
import { FileText, Upload, AlertCircle, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';

export default function AIContentAnalyzer() {
  const [file, setFile] = useState(null);
  const [textInput, setTextInput] = useState('');
  const [inputMethod, setInputMethod] = useState('file'); // 'file' or 'text'
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileUpload = async (e) => {
    const uploadedFile = e.target.files[0];
    if (!uploadedFile) return;

    const validTypes = ['application/pdf', 'text/plain', 'application/msword', 
                        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    
    if (!validTypes.includes(uploadedFile.type) && !uploadedFile.name.endsWith('.txt')) {
      setError('Please upload a PDF, TXT, or DOC file');
      return;
    }

    setFile(uploadedFile);
    setError(null);
    setAnalysis(null);
  };

  const analyzeDocument = async () => {
    if (inputMethod === 'file' && !file) {
      setError('Please upload a file first');
      return;
    }
    if (inputMethod === 'text' && !textInput.trim()) {
      setError('Please enter some text to analyze');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let content;
      
      if (inputMethod === 'text') {
        // Handle text input
        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 4000,
            messages: [{
              role: 'user',
              content: `Analyze this document for AI-generated content patterns. Document content:

${textInput}

Provide a detailed analysis in JSON format with the following structure:

{
  "aiLikelihood": "low|medium|high",
  "confidenceScore": 0-100,
  "overallAssessment": "brief summary",
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "fixRecommendations": ["recommendation 1", "recommendation 2", "recommendation 3"],
  "flaggedItems": [
    {"issue": "issue description", "severity": "low|medium|high", "location": "where in document"},
    {"issue": "issue description", "severity": "low|medium|high", "location": "where in document"}
  ],
  "detailedFindings": {
    "vocabularyPatterns": "analysis of word choice",
    "sentenceStructure": "analysis of sentence patterns",
    "coherenceFlow": "analysis of logical flow",
    "authenticity": "analysis of personal voice"
  }
}

Look for indicators like:
- Repetitive sentence structures
- Overly formal or generic language
- Lack of personal voice or specific examples
- Uniform paragraph lengths
- Predictable transitions
- Absence of minor grammatical variations that humans make

Respond ONLY with the JSON object, no other text.`
            }]
          })
        });

        const data = await response.json();
        content = data.content[0].text;
      } else if (file.type === 'application/pdf') {
        // Convert PDF to base64
        const base64Data = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result.split(',')[1]);
          reader.onerror = () => reject(new Error('Failed to read file'));
          reader.readAsDataURL(file);
        });

        // Send PDF to Claude API
        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 4000,
            messages: [{
              role: 'user',
              content: [
                {
                  type: 'document',
                  source: {
                    type: 'base64',
                    media_type: 'application/pdf',
                    data: base64Data
                  }
                },
                {
                  type: 'text',
                  text: `Analyze this document for AI-generated content patterns. Provide a detailed analysis in JSON format with the following structure:

{
  "aiLikelihood": "low|medium|high",
  "confidenceScore": 0-100,
  "overallAssessment": "brief summary",
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "fixRecommendations": ["recommendation 1", "recommendation 2", "recommendation 3"],
  "flaggedItems": [
    {"issue": "issue description", "severity": "low|medium|high", "location": "where in document"},
    {"issue": "issue description", "severity": "low|medium|high", "location": "where in document"}
  ],
  "detailedFindings": {
    "vocabularyPatterns": "analysis of word choice",
    "sentenceStructure": "analysis of sentence patterns",
    "coherenceFlow": "analysis of logical flow",
    "authenticity": "analysis of personal voice"
  }
}

Look for indicators like:
- Repetitive sentence structures
- Overly formal or generic language
- Lack of personal voice or specific examples
- Uniform paragraph lengths
- Predictable transitions
- Absence of minor grammatical variations that humans make

Respond ONLY with the JSON object, no other text.`
                }
              ]
            }]
          })
        });

        const data = await response.json();
        content = data.content[0].text;
      } else {
        // Handle text files
        const text = await file.text();
        
        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 4000,
            messages: [{
              role: 'user',
              content: `Analyze this document for AI-generated content patterns. Document content:

${text}

Provide a detailed analysis in JSON format with the following structure:

{
  "aiLikelihood": "low|medium|high",
  "confidenceScore": 0-100,
  "overallAssessment": "brief summary",
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "fixRecommendations": ["recommendation 1", "recommendation 2", "recommendation 3"],
  "flaggedItems": [
    {"issue": "issue description", "severity": "low|medium|high", "location": "where in document"},
    {"issue": "issue description", "severity": "low|medium|high", "location": "where in document"}
  ],
  "detailedFindings": {
    "vocabularyPatterns": "analysis of word choice",
    "sentenceStructure": "analysis of sentence patterns",
    "coherenceFlow": "analysis of logical flow",
    "authenticity": "analysis of personal voice"
  }
}

Look for indicators like:
- Repetitive sentence structures
- Overly formal or generic language
- Lack of personal voice or specific examples
- Uniform paragraph lengths
- Predictable transitions
- Absence of minor grammatical variations that humans make

Respond ONLY with the JSON object, no other text.`
            }]
          })
        });

        const data = await response.json();
        content = data.content[0].text;
      }

      // Parse the JSON response
      const cleanContent = content.replace(/```json|```/g, '').trim();
      const result = JSON.parse(cleanContent);
      setAnalysis(result);
    } catch (err) {
      setError('Failed to analyze document. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getLikelihoodColor = (likelihood) => {
    switch(likelihood) {
      case 'low': return 'text-green-600 bg-green-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'high': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getSeverityColor = (severity) => {
    switch(severity) {
      case 'low': return 'text-blue-600 bg-blue-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'high': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <FileText className="w-12 h-12 text-indigo-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">AI Content Analyzer</h1>
          <p className="text-gray-600">Upload your essay, resume, or academic paper for AI detection analysis</p>
        </div>

        {/* Upload Section */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          {/* Input Method Toggle */}
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => {
                setInputMethod('file');
                setTextInput('');
                setError(null);
              }}
              className={`flex-1 py-3 px-6 rounded-lg font-medium transition-colors ${
                inputMethod === 'file'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Upload File
            </button>
            <button
              onClick={() => {
                setInputMethod('text');
                setFile(null);
                setError(null);
              }}
              className={`flex-1 py-3 px-6 rounded-lg font-medium transition-colors ${
                inputMethod === 'text'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Paste Text
            </button>
          </div>

          {/* File Upload */}
          {inputMethod === 'file' && (
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-indigo-300 rounded-lg p-12 cursor-pointer hover:border-indigo-500 transition-colors">
              <Upload className="w-16 h-16 text-indigo-400 mb-4" />
              <span className="text-lg font-medium text-gray-700 mb-2">
                {file ? file.name : 'Click to upload document'}
              </span>
              <span className="text-sm text-gray-500">PDF, TXT, or DOC files</span>
              <input
                type="file"
                onChange={handleFileUpload}
                accept=".pdf,.txt,.doc,.docx"
                className="hidden"
              />
            </label>
          )}

          {/* Text Input */}
          {inputMethod === 'text' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Paste your essay, resume, or academic paper below:
              </label>
              <textarea
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Paste your content here..."
                className="w-full h-64 p-4 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 resize-none"
              />
              <div className="text-sm text-gray-500 mt-2">
                {textInput.length} characters
              </div>
            </div>
          )}

          {/* Analyze Button */}
          <button
            onClick={analyzeDocument}
            disabled={loading || (inputMethod === 'file' && !file) || (inputMethod === 'text' && !textInput.trim())}
            className="w-full mt-6 bg-indigo-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              'Analyze Document'
            )}
          </button>

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
              <AlertCircle className="w-5 h-5 text-red-600 mr-2 mt-0.5" />
              <span className="text-red-700">{error}</span>
            </div>
          )}
        </div>

        {/* Analysis Results */}
        {analysis && (
          <div className="space-y-6">
            {/* Overall Assessment */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Analysis Results</h2>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className={`p-4 rounded-lg ${getLikelihoodColor(analysis.aiLikelihood)}`}>
                  <div className="text-sm font-medium opacity-80">AI Likelihood</div>
                  <div className="text-2xl font-bold capitalize">{analysis.aiLikelihood}</div>
                </div>
                <div className="p-4 rounded-lg bg-indigo-50 text-indigo-600">
                  <div className="text-sm font-medium opacity-80">Confidence Score</div>
                  <div className="text-2xl font-bold">{analysis.confidenceScore}%</div>
                </div>
              </div>

              <p className="text-gray-700 leading-relaxed">{analysis.overallAssessment}</p>
            </div>

            {/* Strengths */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center mb-4">
                <CheckCircle className="w-6 h-6 text-green-600 mr-2" />
                <h3 className="text-xl font-bold text-gray-900">Strengths</h3>
              </div>
              <ul className="space-y-3">
                {analysis.strengths.map((strength, idx) => (
                  <li key={idx} className="flex items-start">
                    <span className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-sm font-medium mr-3 mt-0.5 flex-shrink-0">
                      {idx + 1}
                    </span>
                    <span className="text-gray-700">{strength}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Fix Recommendations */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center mb-4">
                <AlertTriangle className="w-6 h-6 text-amber-600 mr-2" />
                <h3 className="text-xl font-bold text-gray-900">Recommendations</h3>
              </div>
              <ul className="space-y-3">
                {analysis.fixRecommendations.map((rec, idx) => (
                  <li key={idx} className="flex items-start">
                    <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center text-sm font-medium mr-3 mt-0.5 flex-shrink-0">
                      {idx + 1}
                    </span>
                    <span className="text-gray-700">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Flagged Items */}
            {analysis.flaggedItems && analysis.flaggedItems.length > 0 && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-center mb-4">
                  <AlertCircle className="w-6 h-6 text-red-600 mr-2" />
                  <h3 className="text-xl font-bold text-gray-900">Flagged Items</h3>
                </div>
                <div className="space-y-4">
                  {analysis.flaggedItems.map((item, idx) => (
                    <div key={idx} className="border-l-4 border-red-400 pl-4 py-2">
                      <div className="flex items-center mb-1">
                        <span className={`text-xs font-medium px-2 py-1 rounded capitalize ${getSeverityColor(item.severity)}`}>
                          {item.severity}
                        </span>
                        <span className="text-sm text-gray-500 ml-2">{item.location}</span>
                      </div>
                      <p className="text-gray-700">{item.issue}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Detailed Findings */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Detailed Analysis</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Vocabulary Patterns</h4>
                  <p className="text-gray-700">{analysis.detailedFindings.vocabularyPatterns}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Sentence Structure</h4>
                  <p className="text-gray-700">{analysis.detailedFindings.sentenceStructure}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Coherence & Flow</h4>
                  <p className="text-gray-700">{analysis.detailedFindings.coherenceFlow}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Authenticity</h4>
                  <p className="text-gray-700">{analysis.detailedFindings.authenticity}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}