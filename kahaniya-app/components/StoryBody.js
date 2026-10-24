export default function StoryBody({ body }) {
  return body.split('\n').map((l, i) => l.startsWith('## ') ? <h3 key={i} className="h">{l.slice(3)}</h3> : l.trim() ? <p key={i}>{l}</p> : null)
}
