import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { PanelLeft, Swords, RefreshCw, LogIn } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Skeleton, SkeletonText } from '@/components/ui/skeleton'
import { PromptInput } from '@/components/arena/PromptInput'
import { ResponseViewer } from '@/components/arena/ResponseViewer'
import { JudgeCard } from '@/components/arena/JudgeCard'
import { ErrorState } from '@/components/arena/ErrorState'
import { ThinkingAnimation } from '@/components/arena/ThinkingAnimation'
import { ConversationSidebar } from '@/components/history/ConversationSidebar'
import { useArenaBattle } from '@/hooks/useArenaBattle'
import {
  useConversations,
  useConversationDetail,
  useCreateConversation,
  useDeleteConversation,
  usePostConversationMessage,
  useRenameConversation,
} from '@/hooks/useConversations'
import { useAuth, activeConversationKey } from '@/context/AuthContext'
import { messagesToBattles, titleFromInput } from '@/lib/conversations'
import { Button } from '@/components/ui/button'

const MODEL_1_NAME = 'Mistral'
const MODEL_2_NAME = 'Cohere'

function loadStoredActiveId(userId: string | undefined): string | null {
  if (!userId) return null
  try {
    return localStorage.getItem(activeConversationKey(userId))
  } catch {
    return null
  }
}

export default function Home() {
  const { user, isAuthenticated } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const [prompt, setPrompt] = useState<string | null>(null)
  const { mutate, isPending: anonPending, data: anonData, error: anonError, reset: anonReset } = useArenaBattle()
  const [step, setStep] = useState<'models' | 'judge'>('models')
  const resultRef = useRef<HTMLDivElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ---- Persistent history state ----
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [mobileOpen, setMobileOpen] = useState(false)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [persistError, setPersistError] = useState<string | null>(null)

  const createConvo = useCreateConversation()
  const renameConvo = useRenameConversation()
  const deleteConvo = useDeleteConversation()
  const postMessage = usePostConversationMessage()

  // Debounce history search so typing doesn't hammer MongoDB.
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 300)
    return () => clearTimeout(t)
  }, [search])

  const {
    data: conversationList,
    isLoading: listLoading,
    isError: listError,
    refetch: refetchList,
  } = useConversations(debouncedSearch)

  const {
    data: activeDetail,
    isLoading: detailLoading,
    isError: detailError,
    refetch: refetchDetail,
  } = useConversationDetail(isAuthenticated ? activeId : null)

  // Init active conversation from URL (?c=) or per-user localStorage. Never
  // reuse another user's cached id: key is scoped by user id.
  useEffect(() => {
    if (!isAuthenticated || !user) {
      setActiveId(null)
      return
    }
    const fromUrl = searchParams.get('c')
    if (fromUrl) {
      setActiveId(fromUrl)
      try {
        localStorage.setItem(activeConversationKey(user.id), fromUrl)
      } catch {
        // ignore
      }
      return
    }
    setActiveId(loadStoredActiveId(user.id))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user?.id])

  // Clear anonymous one-shot state when switching accounts/conversations.
  useEffect(() => {
    anonReset()
    setPrompt(null)
    setPersistError(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id])

  const persistActiveId = useCallback(
    (id: string | null) => {
      setActiveId(id)
      if (user) {
        try {
          if (id) localStorage.setItem(activeConversationKey(user.id), id)
          else localStorage.removeItem(activeConversationKey(user.id))
        } catch {
          // ignore
        }
      }
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev)
        if (id) next.set('c', id)
        else next.delete('c')
        return next
      })
    },
    [user, setSearchParams]
  )

  const handleNewChat = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    // Intentionally do NOT create a conversation here — a new record is
    // created on the next submitted message to avoid empty duplicates.
    persistActiveId(null)
    setPrompt(null)
    setPersistError(null)
    anonReset()
    postMessage.reset()
    setMobileOpen(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [anonReset, persistActiveId, postMessage])

  const handleSelect = useCallback(
    (id: string) => {
      if (timerRef.current) clearTimeout(timerRef.current)
      persistActiveId(id)
      setPrompt(null)
      setPersistError(null)
      anonReset()
      postMessage.reset()
      setMobileOpen(false)
    },
    [anonReset, persistActiveId, postMessage]
  )

  const handleRename = useCallback(
    async (id: string, title: string) => {
      await renameConvo.mutateAsync({ id, title })
    },
    [renameConvo]
  )

  const handleDelete = useCallback(
    async (id: string) => {
      await deleteConvo.mutateAsync(id)
      if (activeId === id) {
        persistActiveId(null)
        setPrompt(null)
        anonReset()
      }
    },
    [activeId, anonReset, deleteConvo, persistActiveId]
  )

  const handleSubmit = useCallback(
    (input: string) => {
      if (timerRef.current) clearTimeout(timerRef.current)
      setPrompt(input)
      setStep('models')
      setPersistError(null)
      timerRef.current = setTimeout(() => setStep('judge'), 500)

      if (!isAuthenticated) {
        // Anonymous battles use the existing /invoke flow (not persisted).
        anonReset()
        mutate(
          { input },
          {
            onError: () => {
              if (timerRef.current) clearTimeout(timerRef.current)
              setStep('models')
            },
            onSettled: () => {
              if (timerRef.current) clearTimeout(timerRef.current)
            },
          }
        )
        return
      }

      // Authenticated: persist around the existing AI logic.
      // Find/create the conversation, save user msg, run AI, save response.
      const run = async () => {
        try {
          let convoId = activeId
          if (!convoId) {
            const created = await createConvo.mutateAsync(titleFromInput(input))
            convoId = created.id
            persistActiveId(convoId)
          }
          await postMessage.mutateAsync({ id: convoId, input })
          if (timerRef.current) clearTimeout(timerRef.current)
        } catch (err) {
          if (timerRef.current) clearTimeout(timerRef.current)
          setPersistError(err instanceof Error ? err.message : 'Could not save this battle. Please try again.')
        }
      }
      postMessage.reset()
      void run()
    },
    [anonReset, mutate, isAuthenticated, activeId, createConvo, persistActiveId, postMessage]
  )

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  const persistedBattles = useMemo(
    () => (isAuthenticated && activeDetail ? messagesToBattles(activeDetail.messages ?? []) : []),
    [isAuthenticated, activeDetail]
  )

  const isLoading = isAuthenticated ? postMessage.isPending : anonPending
  const anonHasResult = Boolean(anonData?.success && anonData.result)
  const currentError = isAuthenticated ? persistError : anonError?.message

  // Smooth-scroll to loading / results + auto-scroll to newest persisted battle.
  useEffect(() => {
    if ((isLoading || anonHasResult || persistedBattles.length > 0) && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [isLoading, anonHasResult, persistedBattles.length])

  useEffect(() => {
    if (persistedBattles.length > 0 && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' })
    }
  }, [persistedBattles.length, isLoading])

  const handleReset = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setPrompt(null)
    anonReset()
  }, [anonReset])

  const showPersistedView = isAuthenticated && Boolean(activeId)
  const activeTitle = activeDetail?.title ?? null

  return (
    <>
      <main className="relative min-h-screen pt-6 pb-16 scroll-smooth">
        <div className="relative z-10 max-w-[1280px] mx-auto px-4 sm:px-6 flex gap-6 items-start">
          <ConversationSidebar
            conversations={conversationList ?? []}
            activeId={activeId}
            search={search}
            onSearchChange={setSearch}
            isLoading={listLoading}
            isError={listError}
            onRetry={() => void refetchList()}
            isAuthenticated={isAuthenticated}
            onSelect={handleSelect}
            onNewChat={handleNewChat}
            onRename={handleRename}
            onDelete={handleDelete}
            renamingId={renameConvo.isPending ? (renameConvo.variables?.id ?? null) : null}
            deletingId={deleteConvo.isPending ? (deleteConvo.variables ?? null) : null}
            mobileOpen={mobileOpen}
            onCloseMobile={() => setMobileOpen(false)}
          />

          <div className="min-w-0 flex-1">
            {/* Header — minimal, static (no blur filter for perf) */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="text-center mb-8 space-y-3"
            >
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => setMobileOpen(true)}
                  aria-label="Open chat history"
                  className="lg:hidden rounded-xl border border-border-subtle bg-surface p-2 text-on-surface-variant hover:text-on-surface"
                >
                  <PanelLeft className="h-4 w-4" />
                </button>
                <span className="font-mono text-xs text-primary tracking-[0.2em] uppercase opacity-80">
                  Model Comparison
                </span>
              </div>
              <h1 className="font-heading text-4xl md:text-5xl font-bold text-on-surface tracking-tight leading-tight">
                {showPersistedView && activeTitle ? (
                  <span className="block truncate text-2xl md:text-3xl" title={activeTitle}>
                    {activeTitle}
                  </span>
                ) : (
                  <>
                    Compare <span className="text-primary">Two Models</span>
                  </>
                )}
              </h1>
              <p className="text-base text-on-surface-variant max-w-xl mx-auto opacity-70 leading-relaxed">
                Enter a prompt. {MODEL_1_NAME} and {MODEL_2_NAME} respond side-by-side, judged by AI.
              </p>
              {!isAuthenticated && (
                <p className="text-sm text-on-surface-variant/70">
                  <Link to="/login" className="inline-flex items-center gap-1 font-medium text-primary hover:underline underline-offset-4">
                    <LogIn className="h-3.5 w-3.5" />
                    Log in
                  </Link>{' '}
                  to save your battle history.
                </p>
              )}
            </motion.div>

            {/* Prompt — always visible, compact after submit */}
            <div className="max-w-3xl mx-auto mb-10 scroll-mt-24">
              <PromptInput onSubmit={handleSubmit} disabled={isLoading} />
            </div>

            <div ref={resultRef} className="scroll-mt-24" />

            {/* Persisted conversation view */}
            {showPersistedView && (
              <div className="space-y-6 mb-6">
                {detailLoading && (
                  <div className="space-y-6" role="status" aria-label="Loading conversation">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                      {[MODEL_1_NAME, MODEL_2_NAME].map((m) => (
                        <div
                          key={m}
                          className="rounded-2xl bg-surface border border-border-subtle shadow-sm overflow-hidden"
                        >
                          <div className="px-5 py-3.5 border-b border-border-subtle bg-surface-container-low">
                            <Skeleton className="h-5 w-28" />
                          </div>
                          <div className="p-5 space-y-3">
                            <SkeletonText lines={6} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {detailError && (
                  <div className="max-w-2xl mx-auto">
                    <ErrorState
                      message="Could not load this conversation. It may have been deleted."
                      onRetry={() => void refetchDetail()}
                    />
                  </div>
                )}
                {!detailLoading &&
                  !detailError &&
                  persistedBattles.map((b) => (
                    <div key={b.key} className="space-y-6">
                      <p className="text-sm text-on-surface-variant/70 break-words">
                        Responses to: &ldquo;{b.problem}&rdquo;
                      </p>
                      {b.solution_1 ? (
                        <>
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 items-start">
                            <div className="min-w-0">
                              <ResponseViewer
                                content={b.solution_1}
                                label="Model A"
                                modelName={MODEL_1_NAME}
                                side="left"
                                score={b.judge.solution_1_score}
                                delay={0}
                              />
                            </div>
                            <div className="min-w-0">
                              <ResponseViewer
                                content={b.solution_2}
                                label="Model B"
                                modelName={MODEL_2_NAME}
                                side="right"
                                score={b.judge.solution_2_score}
                                delay={0}
                              />
                            </div>
                          </div>
                          <JudgeCard verdict={b.judge} model1Name={MODEL_1_NAME} model2Name={MODEL_2_NAME} />
                        </>
                      ) : (
                        <div className="max-w-2xl mx-auto">
                          <ErrorState
                            message="The AI response for this message could not be saved. Please try sending it again."
                            onRetry={() => handleSubmit(b.problem)}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                {!detailLoading && !detailError && persistedBattles.length === 0 && !isLoading && (
                  <div className="text-center max-w-md mx-auto">
                    <div className="flex items-center justify-center h-12 w-12 rounded-2xl bg-primary/5 border border-primary/10 mx-auto mb-3">
                      <Swords className="h-5 w-5 text-primary/60" />
                    </div>
                    <h3 className="font-heading text-base text-on-surface mb-1">New conversation</h3>
                    <p className="text-sm text-on-surface-variant/70 leading-relaxed">
                      Send your first prompt — it will be saved to this conversation.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Loading */}
            <AnimatePresence mode="wait">
              {isLoading && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-6"
                >
                  <div className="max-w-xl mx-auto">
                    <ThinkingAnimation
                      step={step}
                      model1Name={MODEL_1_NAME}
                      model2Name={MODEL_2_NAME}
                    />
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    {[MODEL_1_NAME, MODEL_2_NAME].map((m) => (
                      <div
                        key={m}
                        className="rounded-2xl bg-surface border border-border-subtle shadow-sm overflow-hidden"
                      >
                        <div className="px-5 py-3.5 border-b border-border-subtle bg-surface-container-low">
                          <Skeleton className="h-5 w-28" />
                        </div>
                        <div className="p-5 space-y-3">
                          <SkeletonText lines={6} />
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error */}
            <AnimatePresence mode="wait">
              {currentError && !isLoading && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="max-w-2xl mx-auto"
                >
                  <ErrorState
                    message={currentError || 'An unexpected error occurred'}
                    onRetry={() => prompt && handleSubmit(prompt)}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Results — anonymous one-shot flow (existing behavior, unchanged) */}
            {!isAuthenticated && (
              <AnimatePresence mode="wait">
                {anonHasResult && !isLoading && !anonError && anonData?.result && (
                  <motion.div
                    key="results"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="min-w-0">
                        <h2 className="font-heading text-xl text-on-surface">Responses</h2>
                        <p className="text-sm text-on-surface-variant/70 mt-1 break-words">
                          Responses to: &ldquo;{anonData.result.problem}&rdquo;
                        </p>
                      </div>
                      <Button variant="secondary" size="sm" onClick={handleReset} className="shrink-0">
                        <RefreshCw className="h-4 w-4" />
                        New Comparison
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 items-start">
                      <div className="min-w-0">
                        <ResponseViewer
                          content={anonData.result.solution_1}
                          label="Model A"
                          modelName={MODEL_1_NAME}
                          side="left"
                          score={anonData.result.judge.solution_1_score}
                          delay={0}
                        />
                      </div>
                      <div className="min-w-0">
                        <ResponseViewer
                          content={anonData.result.solution_2}
                          label="Model B"
                          modelName={MODEL_2_NAME}
                          side="right"
                          score={anonData.result.judge.solution_2_score}
                          delay={0}
                        />
                      </div>
                    </div>

                    <JudgeCard
                      verdict={anonData.result.judge}
                      model1Name={MODEL_1_NAME}
                      model2Name={MODEL_2_NAME}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            )}

            {/* Empty */}
            {!prompt && !isLoading && !anonHasResult && !currentError && !showPersistedView && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="text-center max-w-md mx-auto mt-10"
              >
                <div className="flex items-center justify-center h-12 w-12 rounded-2xl bg-primary/5 border border-primary/10 mx-auto mb-3">
                  <Swords className="h-5 w-5 text-primary/60" />
                </div>
                <h3 className="font-heading text-base text-on-surface mb-1">Ready to compare</h3>
                <p className="text-sm text-on-surface-variant/70 leading-relaxed">
                  Enter a prompt above. Both models answer, and a judge scores them.
                </p>
              </motion.div>
            )}

            <div ref={bottomRef} />
          </div>
        </div>
      </main>

      <footer className="w-full py-8 border-t border-outline-variant/30">
        <div className="flex flex-col sm:flex-row justify-between items-center px-4 sm:px-6 max-w-6xl mx-auto gap-3">
          <div className="text-on-surface-variant/60 text-sm">
            &copy; 2026 AI Battle Arena
          </div>
          <div className="flex items-center gap-2 text-on-surface-variant/40">
            <span className="font-mono text-xs">SYSTEM STABLE</span>
            <span className="w-2 h-2 bg-text-positive rounded-full animate-pulse" />
          </div>
        </div>
      </footer>
    </>
  )
}
