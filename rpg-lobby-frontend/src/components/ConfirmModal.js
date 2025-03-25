import React from 'react';

function ConfirmModal({ isOpen, onClose, onConfirm, message }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-sm">
        <h3 className="text-lg font-medium mb-4 text-center">{message}</h3>
        <div className="flex justify-center space-x-4">
          <button
            onClick={onConfirm}
            className="bg-red-600 text-white p-2 rounded-lg hover:bg-red-700 transition"
          >
            Confirmar
          </button>
          <button
            onClick={onClose}
            className="bg-gray-500 text-white p-2 rounded-lg hover:bg-gray-600 transition"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;