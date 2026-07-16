import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { ArrowLeft, Brain, FileText, Download, MessageSquare, Send, Loader2, X, Eye, Upload, Trash2, File } from 'lucide-react'

export default function ProjectWorkspace() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [project, setProject] = useState(null)
  const [activeTab, setActiveTab] = useState('analyze')
  const [businessDescription, setBusinessDescription] = useState('')
  const [aiQuestions, setAiQuestions] = useState([])
  const [answers, setAnswers] = useState({})
  const [sessionId, setSessionId] = useState(null)
  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading] = useState(false)
  const [reports, setReports] = useState([])
  const [selectedDocs, setSelectedDocs] = useState([])
  const [chatMessage, setChatMessage] = useState('')
  const [chatHistory, setChatHistory] = useState([])
  const [selectedReport, setSelectedReport] = useState(null)
  const [previewReport, setPreviewReport] = useState(null)
  const [previewContent, setPreviewContent] = useState('')
  const [previewLoading, setPreviewLoading] = useState(false)
  const [uploadedDocuments, setUploadedDocuments] = useState([])
  const [uploadingFile, setUploadingFile] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState([])
  const [useUploadedDocs, setUseUploadedDocs] = useState(false)

  const documentTypes = [
    'BRD', 'SRS', 'UserStories', 'TestCases', 
    'ExecutiveSummary', 'BusinessAnalysis', 'SWOT', 
    'GapAnalysis', 'RiskAnalysis', 'GrowthStrategy'
  ]

  useEffect(() => {
    fetchProject()
  }, [id])

  const fetchProject = async () => {
    try {
      const response = await axios.get(`/projects/${id}`)
      const projectData = response.data.data
      setProject(projectData)
      
      // Restore business description
      if (projectData.description) {
        setBusinessDescription(projectData.description)
      }
      
      // Restore AI sessions and analysis
      if (projectData.ai_sessions && projectData.ai_sessions.length > 0) {
        const latestSession = projectData.ai_sessions[0]
        setSessionId(latestSession.id)
        
        // Check if session is completed
        if (latestSession.status === 'completed') {
          // Extract analysis from the last message
          const messages = latestSession.messages || []
          const lastAssistantMessage = messages.filter(m => m.role === 'assistant').pop()
          if (lastAssistantMessage) {
            try {
              const parsed = JSON.parse(lastAssistantMessage.content)
              if (parsed.status === 'completed' && parsed.analysis) {
                setAnalysis(parsed.analysis)
              }
            } catch (e) {
              console.error('Failed to parse analysis:', e)
            }
          }
        }
      }
      
      // Restore reports
      if (projectData.reports) {
        setReports(projectData.reports)
      }
      
      // Restore uploaded documents
      if (projectData.uploaded_documents) {
        setUploadedDocuments(projectData.uploaded_documents)
      }
    } catch (error) {
      console.error('Failed to fetch project:', error)
    }
  }

  const fetchReports = async () => {
    try {
      const response = await axios.get(`/projects/${id}/reports`)
      setReports(response.data.data.reports)
    } catch (error) {
      console.error('Failed to fetch reports:', error)
    }
  }

  const fetchUploadedDocuments = async () => {
    try {
      const response = await axios.get(`/projects/${id}/documents`)
      setUploadedDocuments(response.data.data.documents || [])
    } catch (error) {
      console.error('Failed to fetch uploaded documents:', error)
    }
  }

  const fetchSession = async () => {
    try {
      const response = await axios.get(`/projects/${id}/session`)
      if (response.data.data) {
        const sessionData = response.data.data
        setSessionId(sessionData.session_id)
        if (sessionData.business_description) {
          setBusinessDescription(sessionData.business_description)
        }
        if (sessionData.status === 'completed') {
          setAnalysis(sessionData.analysis)
          setAiQuestions([])
        } else {
          setAiQuestions(sessionData.questions || [])
          setAnalysis(null)
        }
      }
    } catch (error) {
      console.error('Failed to fetch session:', error)
    }
  }

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files)
    if (files.length === 0) return

    setUploadingFile(true)
    try {
      for (const file of files) {
        const formData = new FormData()
        formData.append('file', file)
        
        await axios.post(`/projects/${id}/upload`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })
      }
      await fetchUploadedDocuments()
      setSelectedFiles([])
      alert('Documents uploaded successfully')
    } catch (error) {
      console.error('Failed to upload documents:', error)
      alert('Failed to upload documents. Please try again.')
    } finally {
      setUploadingFile(false)
    }
  }

  const handleDeleteDocument = async (documentId) => {
    if (!confirm('Are you sure you want to delete this document?')) return
    
    try {
      await axios.delete(`/projects/${id}/documents/${documentId}`)
      await fetchUploadedDocuments()
      alert('Document deleted successfully')
    } catch (error) {
      console.error('Failed to delete document:', error)
      alert('Failed to delete document. Please try again.')
    }
  }

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files)
    setSelectedFiles(files)
  }

  const handleStartAnalysis = async () => {
    if (businessDescription.length < 50) {
      alert('Please provide more detail (at least 50 characters)')
      return
    }
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('business_description', businessDescription)
      
      // Add selected files if any
      if (useUploadedDocs && selectedFiles.length > 0) {
        selectedFiles.forEach(file => {
          formData.append('files', file)
        })
      }
      
      const response = await axios.post(`/projects/${id}/analyze`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      setSessionId(response.data.data.session_id)
      setAiQuestions(response.data.data.questions || [])
    } catch (error) {
      console.error('Failed to start analysis:', error)
      alert('Failed to start AI analysis. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitAnswers = async () => {
    setLoading(true)
    try {
      const answerArray = aiQuestions.map((q, i) => ({
        question: q,
        answer: answers[i] || ''
      }))
      const response = await axios.post(`/projects/${id}/questions`, {
        session_id: sessionId,
        answers: answerArray
      })
      
      if (response.data.data.status === 'completed') {
        setAnalysis(response.data.data.analysis)
        setAiQuestions([])
        setAnswers({})
      } else {
        setAiQuestions(response.data.data.next_questions || [])
        setAnswers({})
      }
    } catch (error) {
      console.error('Failed to submit answers:', error)
      alert('Failed to submit answers. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateDocuments = async () => {
    if (selectedDocs.length === 0) {
      alert('Please select at least one document type')
      return
    }
    setLoading(true)
    try {
      await axios.post(`/projects/${id}/generate`, {
        document_types: selectedDocs
      })
      fetchReports()
      setActiveTab('documents')
      setSelectedDocs([])
    } catch (error) {
      console.error('Failed to generate documents:', error)
      alert('Failed to generate documents. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadReport = async (reportId, format) => {
    try {
      const response = await axios.get(`/reports/${reportId}/download?format=${format}`, {
        responseType: 'blob'
      })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const a = document.createElement('a')
      a.href = url
      a.download = `${reportId}.${format}`
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Failed to download report:', error)
      alert('Failed to download report. Please try again.')
    }
  }

  const handlePreviewReport = async (report) => {
    setPreviewReport(report)
    setPreviewLoading(true)
    try {
      // Get the raw content for preview
      const content = report.content?.raw || 'No content available'
      setPreviewContent(content)
    } catch (error) {
      console.error('Failed to preview report:', error)
      alert('Failed to preview report. Please try again.')
    } finally {
      setPreviewLoading(false)
    }
  }

  const renderAnalysis = (analysis) => {
    if (!analysis) return <p className="text-gray-500">No analysis available</p>
    
    // If analysis has raw text, try to parse it as JSON
    if (analysis.raw) {
      try {
        const parsed = JSON.parse(analysis.raw)
        return renderStructuredAnalysis(parsed)
      } catch {
        // If not JSON, render as text
        return (
          <div className="prose prose-sm max-w-none">
            <p className="text-gray-700 whitespace-pre-wrap">{analysis.raw}</p>
          </div>
        )
      }
    }
    
    // If analysis is already structured
    return renderStructuredAnalysis(analysis)
  }

  const renderStructuredAnalysis = (data) => {
    if (!data || typeof data !== 'object') {
      return <p className="text-gray-500">Invalid analysis data</p>
    }

    const sections = []
    
    // Common keys to render as sections
    const sectionKeys = ['workflow', 'pain_points', 'automation_opportunities', 'recommendations', 'current_workflow', 'workflow_summary']
    
    for (const key of sectionKeys) {
      if (data[key]) {
        const title = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
        sections.push(
          <div key={key} className="mb-4">
            <h4 className="font-semibold text-gray-900 mb-2">{title}</h4>
            {Array.isArray(data[key]) ? (
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                {data[key].map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            ) : typeof data[key] === 'object' ? (
              renderStructuredAnalysis(data[key])
            ) : (
              <p className="text-gray-700">{data[key]}</p>
            )}
          </div>
        )
      }
    }

    // If no standard sections found, render all keys
    if (sections.length === 0) {
      for (const [key, value] of Object.entries(data)) {
        if (key !== 'raw') {
          const title = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
          sections.push(
            <div key={key} className="mb-4">
              <h4 className="font-semibold text-gray-900 mb-2">{title}</h4>
              {Array.isArray(value) ? (
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  {value.map((item, idx) => (
                    <li key={idx}>{typeof item === 'object' ? JSON.stringify(item) : item}</li>
                  ))}
                </ul>
              ) : typeof value === 'object' ? (
                renderStructuredAnalysis(value)
              ) : (
                <p className="text-gray-700">{value}</p>
              )}
            </div>
          )
        }
      }
    }

    return sections.length > 0 ? sections : <p className="text-gray-500">No analysis data available</p>
  }

  const handleChat = async () => {
    if (!chatMessage.trim() || !selectedReport) return
    
    const newMessage = { role: 'user', content: chatMessage }
    setChatHistory([...chatHistory, newMessage])
    setChatMessage('')
    setLoading(true)
    
    try {
      const response = await axios.post(`/reports/${selectedReport.id}/chat`, {
        message: chatMessage,
        history: chatHistory
      })
      setChatHistory([...chatHistory, newMessage, { role: 'assistant', content: response.data.data.response }])
    } catch (error) {
      console.error('Failed to send chat message:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center text-gray-600 hover:text-gray-900 transition mr-4"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back
            </button>
            <div className="flex items-center">
              <Brain className="w-8 h-8 text-primary-600 mr-2" />
              <h1 className="text-xl font-bold text-gray-900">{project.name}</h1>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex space-x-1 bg-gray-200 rounded-lg p-1 mb-6">
          <button
            onClick={() => setActiveTab('analyze')}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition ${
              activeTab === 'analyze' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            AI Analysis
          </button>
          <button
            onClick={() => setActiveTab('documents')}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition ${
              activeTab === 'documents' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Documents
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition ${
              activeTab === 'chat' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            AI Chat
          </button>
        </div>

        {activeTab === 'analyze' && (
          <div className="space-y-6">
            {!analysis && !aiQuestions.length ? (
              <>
                {/* Document Upload Section */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload Existing Documents (Optional)</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    If you have existing business documents (PDF, DOCX, TXT), you can upload them here to provide context for the AI analysis.
                  </p>
                  
                  {/* Uploaded Documents List */}
                  {uploadedDocuments.length > 0 && (
                    <div className=" space-y-2 mb-4">
                      <h4 className="text-sm font-medium text-gray-700">Uploaded Documents:</h4>
                      {uploadedDocuments.map((doc) => (
                        <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center">
                            <File className="w-5 h-5 text-gray-600 mr-2" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">{doc.filename}</p>
                              <p className="text-xs text-gray-500">{doc.file_type} • {(doc.file_size / 1024).toFixed(1)} KB</p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleDeleteDocument(doc.id)}
                            className="text-red-600 hover:text-red-700 transition"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Upload Button */}
                  <div className="flex items-center space-x-4">
                    <label className="cursor-pointer bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition flex items-center">
                      <Upload className="w-5 h-5 mr-2" />
                      Upload Documents
                      <input
                        type="file"
                        multiple
                        accept=".pdf,.docx,.doc,.txt,.md,.csv,.json"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                    {uploadingFile && <Loader2 className="w-5 h-5 animate-spin text-primary-600" />}
                  </div>
                </div>

                {/* Business Description Section */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Describe Your Business</h3>
                  <textarea
                    value={businessDescription}
                    onChange={(e) => setBusinessDescription(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                    rows={6}
                    placeholder="Describe your business, its goals, current processes, and what you're looking to achieve..."
                  />
                  
                  {/* Option to use uploaded documents */}
                  {uploadedDocuments.length > 0 && (
                    <div className="mt-4 flex items-center">
                      <input
                        type="checkbox"
                        id="useUploadedDocs"
                        checked={useUploadedDocs}
                        onChange={(e) => setUseUploadedDocs(e.target.checked)}
                        className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                      />
                      <label htmlFor="useUploadedDocs" className="ml-2 text-sm text-gray-700">
                        Use uploaded documents as context for AI analysis
                      </label>
                    </div>
                  )}
                  
                  <button
                    onClick={handleStartAnalysis}
                    disabled={loading}
                    className="mt-4 bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition disabled:bg-primary-400 flex items-center"
                  >
                    {loading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Brain className="w-5 h-5 mr-2" />}
                    Start AI Analysis
                  </button>
                </div>
              </>
            ) : aiQuestions.length > 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Answer Follow-up Questions</h3>
                <div className="space-y-4">
                  {aiQuestions.map((question, index) => (
                    <div key={index}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{question}</label>
                      <textarea
                        value={answers[index] || ''}
                        onChange={(e) => setAnswers({ ...answers, [index]: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                        rows={3}
                      />
                    </div>
                  ))}
                </div>
                <button
                  onClick={handleSubmitAnswers}
                  disabled={loading}
                  className="mt-4 bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition disabled:bg-primary-400 flex items-center"
                >
                  {loading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Send className="w-5 h-5 mr-2" />}
                  Submit Answers
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Business Analysis Complete</h3>
                <div className="bg-gray-50 rounded-lg p-6">
                  {renderAnalysis(analysis)}
                </div>
                <button
                  onClick={() => setActiveTab('documents')}
                  className="mt-4 bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition"
                >
                  Generate Documents
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Documents to Generate</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {documentTypes.map((docType) => (
                  <label key={docType} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedDocs.includes(docType)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedDocs([...selectedDocs, docType])
                        } else {
                          setSelectedDocs(selectedDocs.filter(d => d !== docType))
                        }
                      }}
                      className="rounded text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700">{docType}</span>
                  </label>
                ))}
              </div>
              <button
                onClick={handleGenerateDocuments}
                disabled={loading || selectedDocs.length === 0}
                className="mt-4 bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition disabled:bg-primary-400 flex items-center"
              >
                {loading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <FileText className="w-5 h-5 mr-2" />}
                Generate Documents
              </button>
            </div>

            {reports.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Generated Documents</h3>
                <div className="space-y-3">
                  {reports.map((report) => (
                    <div key={report.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <span className="font-medium text-gray-900">{report.report_type}</span>
                        <span className="text-sm text-gray-500 ml-2">
                          {new Date(report.created_at).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handlePreviewReport(report)}
                          className="text-sm bg-primary-50 text-primary-700 border border-primary-200 px-3 py-1 rounded hover:bg-primary-100 transition flex items-center"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Preview
                        </button>
                        {['pdf', 'docx', 'pptx', 'xlsx'].map((format) => (
                          <button
                            key={format}
                            onClick={() => handleDownloadReport(report.id, format)}
                            className="text-sm bg-white border border-gray-300 px-3 py-1 rounded hover:bg-gray-100 transition flex items-center"
                          >
                            <Download className="w-4 h-4 mr-1" />
                            {format.toUpperCase()}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'chat' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-[600px] flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">AI Chat About Reports</h3>
              <select
                value={selectedReport?.id || ''}
                onChange={(e) => setSelectedReport(reports.find(r => r.id === e.target.value))}
                className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              >
                <option value="">Select a report to chat about</option>
                {reports.map((report) => (
                  <option key={report.id} value={report.id}>
                    {report.report_type} - {new Date(report.created_at).toLocaleDateString()}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {chatHistory.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg p-3 ${
                      msg.role === 'user'
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="p-4 border-t border-gray-200">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleChat()}
                  placeholder="Ask a question about the report..."
                  disabled={!selectedReport || loading}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none disabled:bg-gray-100"
                />
                <button
                  onClick={handleChat}
                  disabled={!selectedReport || loading || !chatMessage.trim()}
                  className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition disabled:bg-primary-400"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Preview Modal */}
      {previewReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Preview: {previewReport.report_type}
              </h3>
              <button
                onClick={() => setPreviewReport(null)}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              {previewLoading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
                </div>
              ) : (
                <div className="prose max-w-none">
                  {renderAnalysis({ raw: previewContent })}
                </div>
              )}
            </div>
            <div className="p-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setPreviewReport(null)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
