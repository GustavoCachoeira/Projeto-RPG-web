import React from 'react';

function CharacterSheetViewModal({ isOpen, onClose, sheet }) {
  if (!isOpen || !sheet) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h3 className="text-lg font-medium mb-4 text-center">
          Ficha de {sheet.name}
        </h3>
        <div className="mb-4">
          <p className="text-gray-700 font-medium">Jogador: {sheet.player?.name || 'Desconhecido'}</p>
        </div>
        <div className="mb-4">
          <h4 className="text-md font-medium mb-2">Atributos</h4>
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="border p-2">Atributo</th>
                <th className="border p-2">Valor</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border p-2">Força</td>
                <td className="border p-2">{sheet.strength}</td>
              </tr>
              <tr>
                <td className="border p-2">Constituição</td>
                <td className="border p-2">{sheet.constitution}</td>
              </tr>
              <tr>
                <td className="border p-2">Agilidade</td>
                <td className="border p-2">{sheet.dexterity}</td>
              </tr>
              <tr>
                <td className="border p-2">Inteligência</td>
                <td className="border p-2">{sheet.intelligence}</td>
              </tr>
              <tr>
                <td className="border p-2">Sabedoria</td>
                <td className="border p-2">{sheet.wisdom}</td>
              </tr>
              <tr>
                <td className="border p-2">Carisma</td>
                <td className="border p-2">{sheet.charisma}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="flex justify-center">
          <button
            onClick={onClose}
            className="bg-gray-500 text-white p-2 rounded-lg hover:bg-gray-600 transition"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}

export default CharacterSheetViewModal;