import React from 'react';
import ReactQuill from 'react-quill';
import DOMPurify from 'dompurify';
import 'react-quill/dist/quill.snow.css';
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
  const handleChange = (content) => {
    const clean = DOMPurify.sanitize(content || '');
    onChange && onChange(clean);
  };

  return (
    <ReactQuill
      value={value || ''}
      onChange={handleChange}
      modules={modules}
      formats={formats}
      className={className}
      theme="snow"
    />
  );
}

export default QuillEditor;
