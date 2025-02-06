import Quill from 'quill';
import QuillEmoji from 'quill-emoji';

// Register modules
Quill.register({
  'modules/emoji-toolbar': QuillEmoji.ToolbarEmoji,
  'modules/emoji-textarea': QuillEmoji.TextAreaEmoji,
  'modules/emoji-shortname': QuillEmoji.ShortNameEmoji,
}, true);

export default Quill; 