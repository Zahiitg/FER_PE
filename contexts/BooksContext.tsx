"use client";
import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useMemo,
  useCallback,
  useState,
} from "react";
import { supabase } from "@/lib/supabaseClient";
import {
  Book,
  NEXT_STATUS,
  matchesFilters,
  summarize,
} from "@/lib/bookUtils";
import { useAuth } from "@/contexts/AuthContext";

// ── Reducer ──────────────────────────────────────────────────────────────────

interface State {
  books: Book[];
  loaded: boolean;
  statusFilter: string;
  search: string;
}

type Action =
  | { type: "RESET" }
  | { type: "SET"; books: Book[] }
  | { type: "ADD"; book: Book }
  | { type: "UPDATE"; id: string; status: string }
  | { type: "REMOVE"; id: string }
  | { type: "SET_FILTER"; filter: string }
  | { type: "SET_SEARCH"; search: string }
  | { type: "CLEAR_FILTERS" };

const initialState: State = {
  books: [],
  loaded: false,
  statusFilter: "",
  search: "",
};

function sortByDate(books: Book[]): Book[] {
  return [...books].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "RESET":
      return initialState;
    case "SET":
      return { ...state, books: sortByDate(action.books), loaded: true };
    case "ADD":
      return { ...state, books: sortByDate([...state.books, action.book]) };
    case "UPDATE":
      return {
        ...state,
        books: state.books.map((b) =>
          b.id === action.id ? { ...b, status: action.status as Book["status"] } : b
        ),
      };
    case "REMOVE":
      return {
        ...state,
        books: state.books.filter((b) => b.id !== action.id),
      };
    case "SET_FILTER":
      return { ...state, statusFilter: action.filter };
    case "SET_SEARCH":
      return { ...state, search: action.search };
    case "CLEAR_FILTERS":
      return { ...state, statusFilter: "", search: "" };
    default:
      return state;
  }
}

// ── Context ───────────────────────────────────────────────────────────────────

interface BooksContextType {
  books: Book[];
  loaded: boolean;
  statusFilter: string;
  search: string;
  setStatusFilter: (v: string) => void;
  setSearch: (v: string) => void;
  clearFilters: () => void;
  visible: Book[];
  summary: ReturnType<typeof summarize>;
  pendingIds: Set<string>;
  addBook: (v: {
    title: string;
    author: string;
    pages: string;
    status: string;
  }) => Promise<{ error?: string }>;
  advanceStatus: (id: string) => Promise<{ error?: string }>;
  deleteBook: (id: string) => Promise<{ error?: string }>;
}

const BooksContext = createContext<BooksContextType | null>(null);

const COLUMNS = "id, user_id, title, author, pages, status, created_at";

export function BooksProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [state, dispatch] = useReducer(reducer, initialState);
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());

  // Load books when user changes
  useEffect(() => {
    let active = true;

    if (!user) {
      dispatch({ type: "RESET" });
      return;
    }

    supabase
      .from("books")
      .select(COLUMNS)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (active && data) {
          dispatch({ type: "SET", books: data as Book[] });
        }
      });

    return () => {
      active = false;
    };
  }, [user]);

  const setStatusFilter = useCallback((filter: string) => {
    dispatch({ type: "SET_FILTER", filter });
  }, []);

  const setSearch = useCallback((search: string) => {
    dispatch({ type: "SET_SEARCH", search });
  }, []);

  const clearFilters = useCallback(() => {
    dispatch({ type: "CLEAR_FILTERS" });
  }, []);

  const visible = useMemo(
    () => state.books.filter((b) => matchesFilters(b, state.statusFilter, state.search)),
    [state.books, state.statusFilter, state.search]
  );

  const summary = useMemo(() => summarize(visible), [visible]);

  const addBook = useCallback(
    async (v: { title: string; author: string; pages: string; status: string }) => {
      const { data, error } = await supabase
        .from("books")
        .insert({
          title: v.title.trim(),
          author: v.author.trim(),
          pages: Number(v.pages.trim()),
          status: v.status,
        })
        .select(COLUMNS)
        .single();

      if (error) return { error: error.message };
      dispatch({ type: "ADD", book: data as Book });
      return {};
    },
    []
  );

  const advanceStatus = useCallback(
    async (id: string): Promise<{ error?: string }> => {
      const book = state.books.find((b) => b.id === id);
      if (!book || book.status === "Finished") return {};
      if (pendingIds.has(id)) return {};

      const next = NEXT_STATUS[book.status];
      if (!next) return {};

      // Optimistic update
      dispatch({ type: "UPDATE", id, status: next });
      setPendingIds((prev) => new Set(prev).add(id));

      const { data, error } = await supabase
        .from("books")
        .update({ status: next })
        .eq("id", id)
        .select("id");

      setPendingIds((prev) => {
        const s = new Set(prev);
        s.delete(id);
        return s;
      });

      if (error || !data || data.length === 0) {
        // Revert
        dispatch({ type: "UPDATE", id, status: book.status });
        return { error: error?.message ?? "Failed to update status" };
      }
      return {};
    },
    [state.books, pendingIds]
  );

  const deleteBook = useCallback(
    async (id: string): Promise<{ error?: string }> => {
      if (pendingIds.has(id)) return {};

      setPendingIds((prev) => new Set(prev).add(id));

      const { data, error } = await supabase
        .from("books")
        .delete()
        .eq("id", id)
        .select("id");

      setPendingIds((prev) => {
        const s = new Set(prev);
        s.delete(id);
        return s;
      });

      if (error || !data || data.length === 0) {
        return { error: error?.message ?? "Failed to delete book" };
      }

      dispatch({ type: "REMOVE", id });
      return {};
    },
    [pendingIds]
  );

  return (
    <BooksContext.Provider
      value={{
        books: state.books,
        loaded: state.loaded,
        statusFilter: state.statusFilter,
        search: state.search,
        setStatusFilter,
        setSearch,
        clearFilters,
        visible,
        summary,
        pendingIds,
        addBook,
        advanceStatus,
        deleteBook,
      }}
    >
      {children}
    </BooksContext.Provider>
  );
}

export function useBooks() {
  const ctx = useContext(BooksContext);
  if (!ctx) throw new Error("useBooks must be used inside BooksProvider");
  return ctx;
}
