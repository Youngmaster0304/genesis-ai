import { create } from 'zustand';
import { SessionState, AgentKey, AgentProgress, DebateMessage, ChiefBrief, GenesisReport } from './types';

interface GenesisStore {
  sessionId: string | null;
  sessionState: SessionState | null;
  setSessionId: (id: string | null) => void;
  setSessionState: (state: SessionState) => void;
  updateAgent: (key: AgentKey, patch: Partial<AgentProgress>) => void;
  addDebateMessage: (msg: DebateMessage) => void;
  setChiefBrief: (brief: ChiefBrief) => void;
  setReport: (report: GenesisReport) => void;
  reset: () => void;
}

const initialSessionState = (): SessionState => ({
  session_id: '',
  status: 'pending',
  chief_brief: null,
  agents: {
    research: { status: 'WAITING', progress: 0, status_text: 'Waiting...', elapsed: 0, metrics: {} },
    patent: { status: 'WAITING', progress: 0, status_text: 'Waiting...', elapsed: 0, metrics: {} },
    market: { status: 'WAITING', progress: 0, status_text: 'Waiting...', elapsed: 0, metrics: {} },
    innovation: { status: 'WAITING', progress: 0, status_text: 'Waiting...', elapsed: 0, metrics: {} },
    technical: { status: 'WAITING', progress: 0, status_text: 'Waiting...', elapsed: 0, metrics: {} },
    business: { status: 'WAITING', progress: 0, status_text: 'Waiting...', elapsed: 0, metrics: {} },
  },
  debate: [],
  report: null,
  created_at: null,
});

export const useGenesisStore = create<GenesisStore>((set) => ({
  sessionId: null,
  sessionState: null,
  setSessionId: (id) => set({ sessionId: id, sessionState: id ? initialSessionState() : null }),
  setSessionState: (state) => set({ sessionState: state }),
  updateAgent: (key, patch) =>
    set((state) => {
      if (!state.sessionState) return {};
      const updatedAgents = {
        ...state.sessionState.agents,
        [key]: { ...state.sessionState.agents[key], ...patch },
      };
      return {
        sessionState: {
          ...state.sessionState,
          agents: updatedAgents,
        },
      };
    }),
  addDebateMessage: (msg) =>
    set((state) => {
      if (!state.sessionState) return {};
      return {
        sessionState: {
          ...state.sessionState,
          debate: [...state.sessionState.debate, msg],
        },
      };
    }),
  setChiefBrief: (brief) =>
    set((state) => {
      if (!state.sessionState) return {};
      return {
        sessionState: {
          ...state.sessionState,
          chief_brief: brief,
          status: 'processing',
        },
      };
    }),
  setReport: (report) =>
    set((state) => {
      if (!state.sessionState) return {};
      return {
        sessionState: {
          ...state.sessionState,
          report,
          status: 'complete',
        },
      };
    }),
  reset: () => set({ sessionId: null, sessionState: null }),
}));
