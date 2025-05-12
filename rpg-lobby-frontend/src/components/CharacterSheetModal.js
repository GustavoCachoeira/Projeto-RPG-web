import React, { useState, useEffect } from 'react';

function CharacterSheetModal({ isOpen, onClose, onSave, initialData }) {
  const [name, setName] = useState('');
  const [strength, setStrength] = useState(8);
  const [constitution, setConstitution] = useState(8);
  const [dexterity, setDexterity] = useState(8);
  const [intelligence, setIntelligence] = useState(8);
  const [wisdom, setWisdom] = useState(8);
  const [charisma, setCharisma] = useState(8);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setStrength(initialData.strength || 8);
      setConstitution(initialData.constitution || 8);
      setDexterity(initialData.dexterity || 8);
      setIntelligence(initialData.intelligence || 8);
      setWisdom(initialData.wisdom || 8);
      setCharisma(initialData.charisma || 8);
    }
  }, [initialData]);

  const handleSubmit = () => {
    onSave({
      name,
      strength: parseInt(strength),
      constitution: parseInt(constitution),
      dexterity: parseInt(dexterity),
      intelligence: parseInt(intelligence),
      wisdom: parseInt(wisdom),
      charisma: parseInt(charisma),
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h3 className="text-lg font-medium mb-4 text-center">
          {initialData ? 'Editar Ficha' : 'Criar Nova Ficha'}
        </h3>
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">Nome do Personagem</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
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
                <td className="border p-2">
                  <input
                    type="number"
                    value={strength}
                    onChange={(e) => setStrength(e.target.value)}
                    className="w-full p-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="1"
                    max="20"
                  />
                </td>
              </tr>
              <tr>
                <td className="border p-2">Constituição</td>
                <td className="border p-2">
                  <input
                    type="number"
                    value={constitution}
                    onChange={(e) => setConstitution(e.target.value)}
                    className="w-full p-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="1"
                    max="20"
                  />
                </td>
              </tr>
              <tr>
                <td className="border p-2">Agilidade</td>
                <td className="border p-2">
                  <input
                    type="number"
                    value={dexterity}
                    onChange={(e) => setDexterity(e.target.value)}
                    className="w-full p-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="1"
                    max="20"
                  />
                </td>
              </tr>
              <tr>
                <td className="border p-2">Inteligência</td>
                <td className="border p-2">
                  <input
                    type="number"
                    value={intelligence}
                    onChange={(e) => setIntelligence(e.target.value)}
                    className="w-full p-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="1"
                    max="20"
                  />
                </td>
              </tr>
              <tr>
                <td className="border p-2">Sabedoria</td>
                <td className="border p-2">
                  <input
                    type="number"
                    value={wisdom}
                    onChange={(e) => setWisdom(e.target.value)}
                    className="w-full p-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="1"
                    max="20"
                  />
                </td>
              </tr>
              <tr>
                <td className="border p-2">Carisma</td>
                <td className="border p-2">
                  <input
                    type="number"
                    value={charisma}
                    onChange={(e) => setCharisma(e.target.value)}
                    className="w-full p-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="1"
                    max="20"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="flex justify-center space-x-4">
          <button
            onClick={handleSubmit}
            className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition"
          >
            Salvar
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

export default CharacterSheetModal;