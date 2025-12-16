import React, { useEffect, useRef } from 'react';
import Quill from 'quill';
import DOMPurify from 'dompurify';
import 'quill/dist/quill.snow.css';
import './QuillEditor.scss';

const modules = {
  toolbar: [
    ['bold', 'italic', 'underline', 'strike'],
    ['blockquote', 'code-block'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    [{ script: 'sub' }, { script: 'super' }],
    [{ header: [1, 2, 3, 4, 5, 6, false] }],
    [{ color: [] }, { background: [] }],
    [{ align: [] }],
    ['clean'],
  ],
};

const formats = [
  'header',
  'bold',
  'italic',
  'underline',
  'strike',
  'blockquote',
  'code-block',
  'list',
  'bullet',
  'script',
  'color',
  'background',
  'align',
];

function QuillEditor({ value = '', onChange, className }) {
  const editorRef = useRef(null);
  const quillRef = useRef(null);
  const lastHtml = useRef('');

  // Initialize Quill once
  useEffect(() => {
    if (!editorRef.current || quillRef.current) return;

    const quill = new Quill(editorRef.current, {
      theme: 'snow',
      modules,
      formats,
    });

    quillRef.current = quill;

    const handleTextChange = () => {
      const html = quill.root.innerHTML;
      const clean = DOMPurify.sanitize(html || '');
      if (clean !== lastHtml.current) {
        lastHtml.current = clean;
        onChange?.(clean);
      }
    };

    quill.on('text-change', handleTextChange);

    return () => {
      quill.off('text-change', handleTextChange);
      quillRef.current = null;
    };
  }, [onChange]);

  // Keep editor content in sync with prop value
  useEffect(() => {
    if (!quillRef.current) return;
    const incoming = DOMPurify.sanitize(value || '');
    if (incoming !== lastHtml.current) {
      lastHtml.current = incoming;
      quillRef.current.root.innerHTML = incoming;
    }
  }, [value]);

  return (
    <div className={`quill ${className || ''}`}>
      <div ref={editorRef} />
    </div>
  );
}

export default QuillEditor;
