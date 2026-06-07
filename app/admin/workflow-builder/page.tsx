"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap, Mail, MessageCircle, Phone, Tag, Clock, GitBranch,
  FileText, CheckSquare, Plus, Trash2, Save, Play, RefreshCw,
  Loader2, X, Sparkles, Send, ArrowRight, LayoutGrid,
} from "lucide-react";
import { AdminTopbar } from "@/components/admin/AdminSidebar";

// ─── Types ──────────────────────────────────────────────────────────────────
interface NodeDef {
  id: string;
  type: "trigger" | "action" | "condition";
  label: string;
  icon: React.ReactNode;
  config?: Record<string, string | number>;
}

interface CanvasNode extends NodeDef {
  x: number;
  y: number;
}

interface Edge {
  from: string;
  to: string;
}

// ─── Node Library ──────────────────────────────────────────────────────────
const NODE_LIBRARY: { section: string; nodes: Omit<NodeDef, "id">[] }[] = [
  {
    section: "Triggers",
    nodes: [
      { type: "trigger", label: "Lead Created",       icon: <Zap size={14} /> },
      { type: "trigger", label: "Order Placed",        icon: <CheckSquare size={14} /> },
      { type: "trigger", label: "Lead Status Changed", icon: <Tag size={14} /> },
      { type: "trigger", label: "Time Delay",          icon: <Clock size={14} /> },
      { type: "trigger", label: "Form Submit",         icon: <FileText size={14} /> },
    ],
  },
  {
    section: "Actions",
    nodes: [
      { type: "action", label: "Send Email",           icon: <Mail size={14} /> },
      { type: "action", label: "Send WhatsApp",        icon: <MessageCircle size={14} /> },
      { type: "action", label: "Send SMS",             icon: <Phone size={14} /> },
      { type: "action", label: "Update Lead Status",   icon: <Tag size={14} /> },
      { type: "action", label: "Create Task",          icon: <CheckSquare size={14} /> },
      { type: "action", label: "Generate Proposal",    icon: <FileText size={14} /> },
    ],
  },
  {
    section: "Conditions",
    nodes: [
      { type: "condition", label: "Lead Score >",      icon: <GitBranch size={14} /> },
      { type: "condition", label: "Budget >",          icon: <GitBranch size={14} /> },
      { type: "condition", label: "City Is",           icon: <GitBranch size={14} /> },
      { type: "condition", label: "Service Is",        icon: <GitBranch size={14} /> },
    ],
  },
];

const TYPE_STYLE = {
  trigger:   { border: "border-blue-500",   bg: "bg-blue-500/10",   text: "text-blue-400",   dot: "bg-blue-500" },
  action:    { border: "border-[#C9A227]",  bg: "bg-[#C9A227]/10",  text: "text-[#C9A227]",  dot: "bg-[#C9A227]" },
  condition: { border: "border-purple-500", bg: "bg-purple-500/10", text: "text-purple-400", dot: "bg-purple-500" },
};

const INPUT = "w-full px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-gold)] transition-all placeholder:text-[var(--color-text-muted)]";
const LABEL = "block text-xs font-semibold text-[var(--color-text-secondary)] mb-1";

let idCounter = 100;
const genId = () => `node-${++idCounter}`;

export default function WorkflowBuilderPage() {
  const [nodes, setNodes] = useState<CanvasNode[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [selected, setSelected] = useState<CanvasNode | null>(null);
  const [dragging, setDragging] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [connecting, setConnecting] = useState<string | null>(null); // source node id
  const [workflowName, setWorkflowName] = useState("New Workflow");
  const [saving, setSaving] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [showTest, setShowTest] = useState(false);
  const [aiGoal, setAiGoal] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const canvasRef = useRef<HTMLDivElement>(null);

  // ── Drag from library ─────────────────────────────────────────────────────
  const onLibraryDragStart = (e: React.DragEvent, nodeDef: Omit<NodeDef, "id">) => {
    e.dataTransfer.setData("nodeLabel", nodeDef.label);
    e.dataTransfer.setData("nodeType", nodeDef.type);
  };

  const onCanvasDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const label = e.dataTransfer.getData("nodeLabel");
    const type = e.dataTransfer.getData("nodeType") as NodeDef["type"];
    if (!label || !type) return;

    const rect = canvasRef.current!.getBoundingClientRect();
    const x = e.clientX - rect.left - 60;
    const y = e.clientY - rect.top - 20;

    const libNode = NODE_LIBRARY.flatMap(s => s.nodes).find(n => n.label === label);
    if (!libNode) return;

    const newNode: CanvasNode = { id: genId(), type, label, icon: libNode.icon, x, y, config: {} };
    setNodes(prev => [...prev, newNode]);
  };

  const onCanvasDragOver = (e: React.DragEvent) => e.preventDefault();

  // ── Drag nodes on canvas ───────────────────────────────────────────────────
  const startDrag = (e: React.MouseEvent, id: string) => {
    if (connecting) {
      // Complete connection
      if (connecting !== id) {
        setEdges(prev => {
          const exists = prev.some(ed => ed.from === connecting && ed.to === id);
          return exists ? prev : [...prev, { from: connecting, to: id }];
        });
      }
      setConnecting(null);
      return;
    }
    e.stopPropagation();
    const node = nodes.find(n => n.id === id);
    if (!node) return;
    setDragging(id);
    setDragOffset({ x: e.clientX - node.x, y: e.clientY - node.y });
    setSelected(node);
  };

  const onMouseMove = useCallback((e: MouseEvent) => {
    if (!dragging) return;
    const canvasRect = canvasRef.current?.getBoundingClientRect();
    if (!canvasRect) return;
    const x = e.clientX - dragOffset.x;
    const y = e.clientY - dragOffset.y;
    setNodes(prev => prev.map(n => n.id === dragging ? { ...n, x, y } : n));
    setSelected(prev => prev?.id === dragging ? { ...prev, x, y } : prev);
  }, [dragging, dragOffset]);

  const onMouseUp = useCallback(() => setDragging(null), []);

  useEffect(() => {
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [onMouseMove, onMouseUp]);

  // ── Connections via SVG ────────────────────────────────────────────────────
  const getNodeCenter = (id: string) => {
    const n = nodes.find(n => n.id === id);
    return n ? { x: n.x + 80, y: n.y + 24 } : null;
  };

  const deleteNode = (id: string) => {
    setNodes(prev => prev.filter(n => n.id !== id));
    setEdges(prev => prev.filter(e => e.from !== id && e.to !== id));
    if (selected?.id === id) setSelected(null);
  };

  const updateNodeConfig = (key: string, value: string) => {
    if (!selected) return;
    const updated = { ...selected, config: { ...selected.config, [key]: value } };
    setSelected(updated);
    setNodes(prev => prev.map(n => n.id === selected.id ? updated : n));
  };

  // ── Save ───────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    setSaving(true);
    try {
      const triggerNode = nodes.find(n => n.type === "trigger");
      const payload = {
        ...(savedId ? { id: savedId } : {}),
        name: workflowName,
        description: "",
        trigger: triggerNode?.label || "manual",
        nodes: JSON.stringify(nodes.map(n => ({ id: n.id, type: n.type, label: n.label, config: n.config || {}, x: n.x, y: n.y }))),
        edges: JSON.stringify(edges),
      };

      const res = await fetch("/api/admin/workflow-builder", {
        method: savedId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        if (!savedId) setSavedId(data.template.id);
      }
    } catch {}
    setSaving(false);
  };

  // ── AI Suggest ─────────────────────────────────────────────────────────────
  const handleAiSuggest = async () => {
    if (!aiGoal.trim() || aiLoading) return;
    setAiLoading(true);
    setAiError("");
    try {
      const res = await fetch("/api/ai/workflow-suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ goal: aiGoal }),
      });
      if (!res.ok) throw new Error("AI failed");
      const data = await res.json();
      const wf = data.workflow;

      if (wf?.name) setWorkflowName(wf.name);

      if (Array.isArray(wf?.nodes)) {
        const canvasNodes: CanvasNode[] = wf.nodes.map((n: any, i: number) => {
          const libNode = NODE_LIBRARY.flatMap(s => s.nodes).find(ln => ln.type === n.type) || NODE_LIBRARY[0].nodes[0];
          return {
            id: n.id || genId(),
            type: n.type as NodeDef["type"],
            label: n.label || libNode.label,
            icon: libNode.icon,
            config: n.config || {},
            x: 60 + i * 200,
            y: 160,
          };
        });
        setNodes(canvasNodes);
      }

      if (Array.isArray(wf?.edges)) {
        setEdges(wf.edges.map((e: any) => ({ from: e.from, to: e.to })));
      }

      setAiGoal("");
    } catch {
      setAiError("AI suggestion failed. Please try again.");
    }
    setAiLoading(false);
  };

  const selectedStyle = selected ? TYPE_STYLE[selected.type] : null;

  return (
    <>
      <AdminTopbar title="Workflow Builder" />
      <div className="flex h-[calc(100vh-56px)] overflow-hidden">

        {/* Left panel — Node Library */}
        <div className="w-52 shrink-0 border-r border-[var(--color-border)] bg-[var(--color-bg-secondary)] overflow-y-auto flex flex-col">
          <div className="p-3 border-b border-[var(--color-border)]">
            <p className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wide">Node Library</p>
            <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5">Drag to canvas</p>
          </div>
          <div className="flex-1 p-2 space-y-3">
            {NODE_LIBRARY.map(({ section, nodes: libNodes }) => (
              <div key={section}>
                <p className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wide px-1 mb-1.5">{section}</p>
                <div className="space-y-1">
                  {libNodes.map(n => {
                    const st = TYPE_STYLE[n.type];
                    return (
                      <div
                        key={n.label}
                        draggable
                        onDragStart={e => onLibraryDragStart(e, n)}
                        className={`flex items-center gap-2 px-2.5 py-2 rounded-lg border ${st.border} ${st.bg} cursor-grab active:cursor-grabbing select-none`}
                      >
                        <span className={st.text}>{n.icon}</span>
                        <span className={`text-xs font-medium ${st.text}`}>{n.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          <div className="p-3 border-t border-[var(--color-border)]">
            <p className="text-[10px] text-[var(--color-text-muted)] text-center leading-relaxed">
              Click output dot to connect nodes
            </p>
          </div>
        </div>

        {/* Center — Canvas */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* AI Suggest bar */}
          <div className="flex items-center gap-2 px-4 py-2 border-b border-[var(--color-border)] bg-[var(--color-bg)]">
            <Sparkles size={15} className="text-[var(--color-gold)] shrink-0" />
            <input
              value={aiGoal}
              onChange={e => setAiGoal(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleAiSuggest()}
              placeholder="AI Suggest: Describe your goal (e.g. nurture leads who have not responded in 3 days)..."
              className="flex-1 bg-transparent text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] outline-none"
            />
            {aiError && <p className="text-xs text-red-500 shrink-0">{aiError}</p>}
            <button onClick={handleAiSuggest} disabled={aiLoading || !aiGoal.trim()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--color-gold)] text-white text-xs font-semibold hover:opacity-90 disabled:opacity-50 transition-all shrink-0">
              {aiLoading ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
              {aiLoading ? "Thinking..." : "Suggest"}
            </button>
          </div>

          {/* Canvas area */}
          <div
            ref={canvasRef}
            className="flex-1 relative overflow-hidden select-none"
            style={{
              background: "radial-gradient(circle, var(--color-border) 1px, transparent 1px)",
              backgroundSize: "24px 24px",
              backgroundColor: "var(--color-bg)",
            }}
            onDrop={onCanvasDrop}
            onDragOver={onCanvasDragOver}
            onClick={() => { if (!connecting) setSelected(null); }}
          >
            {nodes.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center">
                  <LayoutGrid size={40} className="text-[var(--color-border)] mx-auto mb-3" />
                  <p className="text-[var(--color-text-muted)] text-sm">Drag nodes from the left panel or use AI Suggest</p>
                </div>
              </div>
            )}

            {/* SVG Edges */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
              {edges.map((edge, i) => {
                const from = getNodeCenter(edge.from);
                const to = getNodeCenter(edge.to);
                if (!from || !to) return null;
                const dx = to.x - from.x;
                const cp1x = from.x + dx * 0.5;
                const cp2x = to.x - dx * 0.5;
                return (
                  <g key={i}>
                    <path
                      d={`M${from.x},${from.y} C${cp1x},${from.y} ${cp2x},${to.y} ${to.x},${to.y}`}
                      fill="none"
                      stroke="var(--color-gold)"
                      strokeWidth={2}
                      strokeDasharray="5,3"
                      opacity={0.7}
                    />
                    <polygon
                      points={`${to.x},${to.y} ${to.x - 8},${to.y - 4} ${to.x - 8},${to.y + 4}`}
                      fill="var(--color-gold)"
                      opacity={0.7}
                    />
                  </g>
                );
              })}
            </svg>

            {/* Nodes */}
            {nodes.map(node => {
              const st = TYPE_STYLE[node.type];
              const isSelected = selected?.id === node.id;
              const isConnSrc = connecting === node.id;
              return (
                <div
                  key={node.id}
                  style={{ left: node.x, top: node.y, zIndex: isSelected ? 10 : 2 }}
                  className={`absolute cursor-pointer`}
                  onMouseDown={e => startDrag(e, node.id)}
                >
                  <div className={`w-40 rounded-xl border-2 p-3 transition-all shadow-md ${st.bg} ${isSelected ? st.border + " shadow-lg" : "border-transparent"} ${isConnSrc ? "ring-2 ring-offset-1 ring-[var(--color-gold)]" : ""}`}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5">
                        <span className={st.text}>{node.icon}</span>
                        <span className={`text-xs font-semibold ${st.text} leading-tight`}>{node.label}</span>
                      </div>
                      <button
                        onMouseDown={e => { e.stopPropagation(); deleteNode(node.id); }}
                        className="text-[var(--color-text-muted)] hover:text-red-500 transition-colors"
                      >
                        <X size={12} />
                      </button>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className={`w-2 h-2 rounded-full ${st.dot}`} />
                      <button
                        onMouseDown={e => {
                          e.stopPropagation();
                          setConnecting(prev => prev === node.id ? null : node.id);
                        }}
                        className={`w-2 h-2 rounded-full border-2 transition-all ${isConnSrc ? "border-[var(--color-gold)] bg-[var(--color-gold)]" : "border-[var(--color-border)] hover:border-[var(--color-gold)]"}`}
                        title="Connect to another node"
                      />
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Connecting indicator */}
            {connecting && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-[var(--color-gold)] text-white text-xs font-semibold shadow-lg z-20">
                Click another node to connect — or press Escape to cancel
              </div>
            )}
          </div>

          {/* Bottom toolbar */}
          <div className="flex items-center gap-3 px-4 py-2.5 border-t border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
            <input
              value={workflowName}
              onChange={e => setWorkflowName(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-sm font-semibold text-[var(--color-text)] outline-none focus:border-[var(--color-gold)] transition-all w-56"
              placeholder="Workflow name"
            />
            <button onClick={handleSave} disabled={saving}
              className="btn-gold flex items-center gap-2 text-sm py-1.5 disabled:opacity-60">
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              {saving ? "Saving..." : savedId ? "Save Changes" : "Save Workflow"}
            </button>
            <button onClick={() => setShowTest(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[var(--color-border)] text-sm text-[var(--color-text-secondary)] hover:border-[var(--color-gold)] hover:text-[var(--color-gold)] transition-all">
              <Play size={14} /> Test Run
            </button>
            <button onClick={() => { setNodes([]); setEdges([]); setSelected(null); setSavedId(null); setWorkflowName("New Workflow"); }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[var(--color-border)] text-sm text-[var(--color-text-secondary)] hover:border-red-500 hover:text-red-500 transition-all">
              <RefreshCw size={14} /> Clear Canvas
            </button>
            <div className="ml-auto text-xs text-[var(--color-text-muted)]">
              {nodes.length} nodes · {edges.length} connections
            </div>
          </div>
        </div>

        {/* Right panel — Properties */}
        <AnimatePresence>
          {selected && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 280, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="border-l border-[var(--color-border)] bg-[var(--color-bg)] overflow-hidden shrink-0"
            >
              <div className="w-[280px] h-full flex flex-col">
                <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-border)]">
                  <div>
                    <p className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wide">Properties</p>
                    <p className={`text-sm font-semibold ${selectedStyle?.text}`}>{selected.label}</p>
                  </div>
                  <button onClick={() => setSelected(null)} className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors">
                    <X size={16} />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  <div>
                    <label className={LABEL}>Node Label</label>
                    <input value={selected.label}
                      onChange={e => {
                        const updated = { ...selected, label: e.target.value };
                        setSelected(updated);
                        setNodes(prev => prev.map(n => n.id === selected.id ? updated : n));
                      }}
                      className={INPUT} />
                  </div>

                  {/* Email action fields */}
                  {selected.label === "Send Email" && (
                    <>
                      <div>
                        <label className={LABEL}>Subject Template</label>
                        <input value={String(selected.config?.subject || "")}
                          onChange={e => updateNodeConfig("subject", e.target.value)}
                          placeholder="Your inquiry about {{service}}" className={INPUT} />
                      </div>
                      <div>
                        <label className={LABEL}>Body Template</label>
                        <textarea rows={4} value={String(selected.config?.body || "")}
                          onChange={e => updateNodeConfig("body", e.target.value)}
                          placeholder="Hi {{name}}, thanks for reaching out..."
                          className={INPUT + " resize-none"} />
                      </div>
                      <div>
                        <label className={LABEL}>Delay (hours)</label>
                        <input type="number" value={String(selected.config?.delay || "")}
                          onChange={e => updateNodeConfig("delay", e.target.value)}
                          placeholder="0" className={INPUT} />
                      </div>
                    </>
                  )}

                  {/* WhatsApp action fields */}
                  {selected.label === "Send WhatsApp" && (
                    <div>
                      <label className={LABEL}>Message Template</label>
                      <textarea rows={4} value={String(selected.config?.message || "")}
                        onChange={e => updateNodeConfig("message", e.target.value)}
                        placeholder="Hi {{name}}! Your inquiry has been received..."
                        className={INPUT + " resize-none"} />
                    </div>
                  )}

                  {/* SMS action fields */}
                  {selected.label === "Send SMS" && (
                    <div>
                      <label className={LABEL}>SMS Message</label>
                      <textarea rows={3} value={String(selected.config?.message || "")}
                        onChange={e => updateNodeConfig("message", e.target.value)}
                        placeholder="KVL TECH: Your order is confirmed. Reply STOP to unsubscribe."
                        className={INPUT + " resize-none"} />
                    </div>
                  )}

                  {/* Condition fields */}
                  {selected.type === "condition" && (
                    <>
                      <div>
                        <label className={LABEL}>Field</label>
                        <select value={String(selected.config?.field || "")}
                          onChange={e => updateNodeConfig("field", e.target.value)}
                          className={INPUT}>
                          <option value="">Select field</option>
                          <option value="score">Lead Score</option>
                          <option value="budget">Budget</option>
                          <option value="city">City</option>
                          <option value="service">Service</option>
                        </select>
                      </div>
                      <div>
                        <label className={LABEL}>Operator</label>
                        <select value={String(selected.config?.operator || "")}
                          onChange={e => updateNodeConfig("operator", e.target.value)}
                          className={INPUT}>
                          <option value="">Select operator</option>
                          <option value=">">&gt; greater than</option>
                          <option value="<">&lt; less than</option>
                          <option value="=">= equals</option>
                          <option value="contains">contains</option>
                        </select>
                      </div>
                      <div>
                        <label className={LABEL}>Value</label>
                        <input value={String(selected.config?.value || "")}
                          onChange={e => updateNodeConfig("value", e.target.value)}
                          placeholder="e.g. 70" className={INPUT} />
                      </div>
                    </>
                  )}

                  {/* Time delay */}
                  {selected.label === "Time Delay" && (
                    <div>
                      <label className={LABEL}>Delay Duration</label>
                      <input value={String(selected.config?.delay || "")}
                        onChange={e => updateNodeConfig("delay", e.target.value)}
                        placeholder="e.g. 3 days, 2 hours" className={INPUT} />
                    </div>
                  )}

                  {/* Update Lead Status */}
                  {selected.label === "Update Lead Status" && (
                    <div>
                      <label className={LABEL}>New Status</label>
                      <select value={String(selected.config?.status || "")}
                        onChange={e => updateNodeConfig("status", e.target.value)}
                        className={INPUT}>
                        <option value="">Select status</option>
                        <option value="CONTACTED">Contacted</option>
                        <option value="QUALIFIED">Qualified</option>
                        <option value="PROPOSAL_SENT">Proposal Sent</option>
                        <option value="WON">Won</option>
                        <option value="LOST">Lost</option>
                      </select>
                    </div>
                  )}

                  {/* Node type badge */}
                  <div className={`px-3 py-2 rounded-xl ${selectedStyle?.bg} border ${selectedStyle?.border}`}>
                    <p className={`text-xs font-semibold ${selectedStyle?.text} capitalize`}>
                      {selected.type} node
                    </p>
                  </div>

                  <button
                    onClick={() => deleteNode(selected.id)}
                    className="w-full flex items-center justify-center gap-2 py-2 rounded-xl border border-red-500/30 text-red-500 text-sm font-semibold hover:bg-red-500/10 transition-all"
                  >
                    <Trash2 size={14} /> Delete Node
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Test Run Modal */}
      <AnimatePresence>
        {showTest && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowTest(false)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="bg-[var(--color-bg)] rounded-2xl max-w-md w-full p-6 shadow-2xl"
              onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-bold text-lg text-[var(--color-text)]">Test Run</h3>
                <button onClick={() => setShowTest(false)} className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors">
                  <X size={18} />
                </button>
              </div>
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)]">
                  <p className="text-sm font-semibold text-[var(--color-text)] mb-2">Workflow: {workflowName}</p>
                  <p className="text-xs text-[var(--color-text-muted)]">{nodes.length} nodes · {edges.length} connections</p>
                </div>
                <div className="space-y-2">
                  {nodes.map((n, i) => {
                    const st = TYPE_STYLE[n.type];
                    return (
                      <div key={n.id} className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${st.bg} ${st.text}`}>{i + 1}</div>
                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${st.bg} flex-1`}>
                          <span className={st.text}>{n.icon}</span>
                          <span className={`text-xs font-medium ${st.text}`}>{n.label}</span>
                        </div>
                        {i < nodes.length - 1 && <ArrowRight size={12} className="text-[var(--color-text-muted)]" />}
                      </div>
                    );
                  })}
                </div>
                <p className="text-xs text-[var(--color-text-muted)] bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 rounded-xl p-3">
                  Test run is a simulation only. No actual emails or messages will be sent.
                </p>
              </div>
              <button onClick={() => setShowTest(false)} className="btn-gold w-full mt-4">Close Test</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
