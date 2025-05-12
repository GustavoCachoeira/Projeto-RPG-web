import React, { useState, useEffect } from 'react';
import axios from 'axios';

function CharacterSheetModal({ isOpen, onClose, onSave, initialData }) {
  const [name, setName] = useState(initialData?.name || '');
  const [className, setClassName] = useState(initialData?.class || '');
  const [subclass, setSubclass] = useState(initialData?.subclass || '');
  const [level, setLevel] = useState(initialData?.level || 1);
  const [xp, setXp] = useState(initialData?.xp || 0);
  const [strength, setStrength] = useState(initialData?.strength || 8);
  const [constitution, setConstitution] = useState(initialData?.constitution || 8);
  const [dexterity, setDexterity] = useState(initialData?.dexterity || 8);
  const [intelligence, setIntelligence] = useState(initialData?.intelligence || 8);
  const [wisdom, setWisdom] = useState(initialData?.wisdom || 8);
  const [charisma, setCharisma] = useState(initialData?.charisma || 8);
  const [inventory, setInventory] = useState(initialData?.inventory || [{ itemName: '', quantity: 1 }]);
  const [error, setError] = useState('');

  useEffect(() => {
    setName(initialData?.name || '');
    setClassName(initialData?.class || '');
    setSubclass(initialData?.subclass || '');
    setLevel(initialData?.level || 1);
    setXp(initialData?.xp || 0);
    setStrength(initialData?.strength || 8);
    setConstitution(initialData?.constitution || 8);
    setDexterity(initialData?.dexterity || 8);
    setIntelligence(initialData?.intelligence || 8);
    setWisdom(initialData?.wisdom || 8);
    setCharisma(initialData?.charisma || 8);
    setInventory(initialData?.inventory?.length > 0 ? initialData.inventory : [{ itemName: '', quantity: 1 }]);
    setError('');
  }, [initialData, isOpen]);

  const handleSave = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Usuário não autenticado');
      return;
    }
    if (!initialData?.lobbyId) {
      setError('ID do lobby não encontrado. Contate o suporte.');
      return;
    }
    const data = {
      lobbyId: initialData.lobbyId,
      name: name || '',
      class: className || null,
      subclass: subclass || null,
      level: parseInt(level) || 1,
      xp: parseInt(xp) || 0,
      strength: parseInt(strength) || 8,
      constitution: parseInt(constitution) || 8,
      dexterity: parseInt(dexterity) || 8,
      intelligence: parseInt(intelligence) || 8,
      wisdom: parseInt(wisdom) || 8,
      charisma: parseInt(charisma) || 8,
      inventory: inventory
        .filter(item => item.itemName.trim() !== '')
        .map(item => ({
          itemName: item.itemName.trim(),
          quantity: parseInt(item.quantity) || 1,
        })),
    };
    console.log('Dados enviados:', data); // Debug: Verificar os dados enviados
    try {
      const response = initialData?.id
        ? await axios.patch(
            `http://localhost:5000/character-sheets/${initialData.id}`,
            data,
            { headers: { Authorization: `Bearer ${token}` } }
          )
        : await axios.post(
            'http://localhost:5000/character-sheets',
            data,
            { headers: { Authorization: `Bearer ${token}` } }
          );
      console.log('Resposta do servidor:', response.data); // Debug: Verificar a resposta
      onSave(response.data);
      onClose();
      setError('');
    } catch (err) {
      setError('Erro ao salvar ficha: ' + (err.response?.data?.error || err.message));
      console.error('Erro ao salvar ficha:', err.response || err);
    }
  };

  const addInventoryItem = () => {
    setInventory([...inventory, { itemName: '', quantity: 1 }]);
  };

  const updateInventoryItem = (index, field, value) => {
    const newInventory = [...inventory];
    newInventory[index][field] = value;
    setInventory(newInventory);
  };

  const handleCancel = () => {
    setName(initialData?.name || '');
    setClassName(initialData?.class || '');
    setSubclass(initialData?.subclass || '');
    setLevel(initialData?.level || 1);
    setXp(initialData?.xp || 0);
    setStrength(initialData?.strength || 8);
    setConstitution(initialData?.constitution || 8);
    setDexterity(initialData?.dexterity || 8);
    setIntelligence(initialData?.intelligence || 8);
    setWisdom(initialData?.wisdom || 8);
    setCharisma(initialData?.charisma || 8);
    setInventory(initialData?.inventory?.length > 0 ? initialData.inventory : [{ itemName: '', quantity: 1 }]);
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl h-[80vh] flex flex-col">
        <h3 className="text-lg font-medium mb-4 text-center">
          {initialData?.id ? 'Editar Ficha' : 'Criar Nova Ficha'}
        </h3>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <div className="space-y-4 flex-1 overflow-y-auto pr-2">
          <div>
            <label className="block text-gray-700 font-medium">Nome do Personagem</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 border rounded-lg"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium">Classe</label>
            <input
              type="text"
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              className="w-full p-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium">Subclasse</label>
            <input
              type="text"
              value={subclass}
              onChange={(e) => setSubclass(e.target.value)}
              className="w-full p-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium">Nível</label>
            <input
              type="number"
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className="w-full p-2 border rounded-lg"
              min="1"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium">XP</label>
            <input
              type="number"
              value={xp}
              onChange={(e) => setXp(e.target.value)}
              className="w-full p-2 border rounded-lg"
              min="0"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium">Força</label>
            <input
              type="number"
              value={strength}
              onChange={(e) => setStrength(e.target.value)}
              className="w-full p-2 border rounded-lg"
              min="1"
              max="20"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium">Constituição</label>
            <input
              type="number"
              value={constitution}
              onChange={(e) => setConstitution(e.target.value)}
              className="w-full p-2 border rounded-lg"
              min="1"
              max="20"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium">Agilidade</label>
            <input
              type="number"
              value={dexterity}
              onChange={(e) => setDexterity(e.target.value)}
              className="w-full p-2 border rounded-lg"
              min="1"
              max="20"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium">Inteligência</label>
            <input
              type="number"
              value={intelligence}
              onChange={(e) => setIntelligence(e.target.value)}
              className="w-full p-2 border rounded-lg"
              min="1"
              max="20"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium">Sabedoria</label>
            <input
              type="number"
              value={wisdom}
              onChange={(e) => setWisdom(e.target.value)}
              className="w-full p-2 border rounded-lg"
              min="1"
              max="20"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium">Carisma</label>
            <input
              type="number"
              value={charisma}
              onChange={(e) => setCharisma(e.target.value)}
              className="w-full p-2 border rounded-lg"
              min="1"
              max="20"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium">Inventário</label>
            {inventory.map((item, index) => (
              <div key={index} className="flex space-x-2 mb-2">
                <input
                  type="text"
                  value={item.itemName}
                  onChange={(e) => updateInventoryItem(index, 'itemName', e.target.value)}
                  placeholder="Nome do item"
                  className="w-2/3 p-2 border rounded-lg"
                />
                <input
                  type="number"
                  value={item.quantity}
                  onChange={(e) => updateInventoryItem(index, 'quantity', e.target.value)}
                  placeholder="Quantidade"
                  className="w-1/3 p-2 border rounded-lg"
                  min="1"
                />
              </div>
            ))}
            <button
              onClick={addInventoryItem}
              className="bg-green-600 text-white p-2 rounded-lg hover:bg-green-700 transition mt-2"
            >
              +
            </button>
          </div>
        </div>
        <div className="flex justify-end mt-4 space-x-2">
          <button
            onClick={handleCancel}
            className="bg-gray-500 text-white p-2 rounded-lg hover:bg-gray-600 transition"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition"
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
}

export default CharacterSheetModal;