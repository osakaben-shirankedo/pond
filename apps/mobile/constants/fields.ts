export const Fields = [
  { id: 'programming', label: 'プログラミング', icon: 'terminal' },
  { id: 'math',        label: '数学',           icon: 'functions' },
  { id: 'english',     label: '英語',           icon: 'translate' },
  { id: 'art',         label: 'アート',         icon: 'palette' },
  { id: 'music',       label: '音楽',           icon: 'music_note' },
  { id: 'science',     label: '科学',           icon: 'science' },
  { id: 'physics',     label: '物理',           icon: 'atom' },
  { id: 'chemistry',   label: '化学',           icon: 'flask' },
  { id: 'biology',     label: '生物',           icon: 'leaf' },
  { id: 'history',     label: '歴史',           icon: 'book' },
  { id: 'geography',   label: '地理',           icon: 'globe' },
  { id: 'japanese',    label: '国語',           icon: 'pen' },
  { id: 'ethics',      label: '倫理・哲学',     icon: 'brain' },
  { id: 'economics',   label: '経済',           icon: 'chart' },
] as const;

export type FieldId = typeof Fields[number]['id'];
