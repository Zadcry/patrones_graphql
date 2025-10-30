import React, { useState, useEffect } from 'react';
// Importamos 'gql' y 'useApolloClient'
import { gql, useApolloClient } from '@apollo/client';

// --- Componente de Pokémon (Sin cambios) ---

function PokemonQueryComponent() {
  const [pokemonId, setPokemonId] = useState('1'); 
  const [pokemonFields, setPokemonFields] = useState({
    name: true,
    height: true,
    weight: true,
    base_experience: true,
  });

  const client = useApolloClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const handleSearch = async () => {
    setLoading(true);
    setError(null);
    setData(null);

    const selectedFields = Object.keys(pokemonFields).filter(key => pokemonFields[key]);
    const fieldsString = selectedFields.join(' ');

    const DYNAMIC_POKEMON_QUERY = gql(`
      query GetPokemon($id: ID!) {
        pokemon(id: $id) {
          id
          __typename
          ${fieldsString} 
        }
      }
    `);

    try {
      const result = await client.query({
        query: DYNAMIC_POKEMON_QUERY,
        variables: { id: pokemonId },
      });
      setData(result.data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePokemonFieldChange = (event) => {
    const { name, checked } = event.target;
    setPokemonFields((prevFields) => ({
      ...prevFields,
      [name]: checked,
    }));
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-blue-600">Consultar Pokémon</h2>
      
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={pokemonId}
          onChange={(e) => setPokemonId(e.target.value)}
          placeholder="ID del Pokémon (ej. 1, 25)"
          className="flex-grow p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleSearch}
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:bg-gray-400"
        >
          {loading ? 'Buscando...' : 'Buscar'}
        </button>
      </div>

      <div className="mb-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
        {Object.keys(pokemonFields).map((field) => (
          <label key={field} className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              name={field}
              checked={pokemonFields[field]}
              onChange={handlePokemonFieldChange}
              className="rounded text-blue-500"
            />
            <span className="text-gray-700 capitalize">{field.replace('_', ' ')}</span>
          </label>
        ))}
      </div>

      <div className="mt-4 p-4 bg-gray-50 rounded-md min-h-[100px]">
        {loading && <p className="text-gray-500">Cargando...</p>}
        {error && <p className="text-red-500">Error: {error.message}</p>}
        {data && data.pokemon && (
          <div>
            <h3 className="text-xl font-semibold">Resultado (ID: {data.pokemon.id})</h3>
            <ul className="list-disc list-inside mt-2">
              {Object.keys(data.pokemon)
                .filter(key => key !== 'id' && key !== '__typename')
                .map(key => (
                  <li key={key}>
                    <span className="font-semibold capitalize">{key.replace('_', ' ')}:</span> {data.pokemon[key]}
                  </li>
              ))}
            </ul>
          </div>
        )}
        {!data && !error && !loading && (
          <p className="text-gray-500">Introduce un ID y haz clic en "Buscar".</p>
        )}
      </div>
    </div>
  );
}

// --- ComponentE de Estudiantes (ACTUALIZADO) ---

function StudentsQueryComponent() {
  const [studentFields, setStudentFields] = useState({
    nombre: true,
    carrera: true,
    semestre: true,
    promedio: true,
  });

  const client = useApolloClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  // 1. ELIMINAMOS el 'useEffect' que ejecutaba la consulta automáticamente.

  // 2. CREAMOS una función 'handleStudentSearch' para ser llamada por el botón.
  const handleStudentSearch = async () => {
    setLoading(true);
    setError(null);
    setData(null); // Limpiar resultados anteriores

    // Construir la consulta dinámica (misma lógica que estaba en el useEffect)
    const selectedFields = Object.keys(studentFields).filter(key => studentFields[key]);
    const fieldsString = selectedFields.join(' ');

    const DYNAMIC_STUDENTS_QUERY = gql(`
      query GetStudents {
        students {
          id
          __typename
          ${fieldsString}
        }
      }
    `);

    try {
      const result = await client.query({
        query: DYNAMIC_STUDENTS_QUERY,
        fetchPolicy: 'network-only', 
      });
      setData(result.data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  // El manejador de checkboxes ahora solo actualiza el estado.
  const handleStudentFieldChange = (event) => {
    const { name, checked } = event.target;
    setStudentFields((prevFields) => ({
      ...prevFields,
      [name]: checked,
    }));
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-green-600">Consultar Estudiantes (Supabase)</h2>

      {/* Checkboxes (sin cambios en el JSX) */}
      <div className="mb-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
        {Object.keys(studentFields).map((field) => (
          <label key={field} className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              name={field}
              checked={studentFields[field]}
              onChange={handleStudentFieldChange}
              className="rounded text-green-500"
            />
            <span className="text-gray-700 capitalize">{field}</span>
          </label>
        ))}
      </div>

      {/* 3. AÑADIMOS el botón de búsqueda */}
      <div className="mb-4">
        <button
          onClick={handleStudentSearch}
          disabled={loading}
          className="w-full bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 disabled:bg-gray-400 sm:w-auto"
        >
          {loading ? 'Buscando...' : 'Buscar'}
        </button>
      </div>

      {/* Resultados (sin cambios en la lógica de renderizado) */}
      <div className="mt-4 p-4 bg-gray-50 rounded-md min-h-[150px]">
        {loading && <p className="text-gray-500">Cargando estudiantes...</p>}
        {error && <p className="text-red-500">Error: {error.message}</p>}
        {data && data.students && (
          <div>
            <h3 className="text-xl font-semibold">Resultados ({data.students.length} estudiantes)</h3>
            <ul className="divide-y divide-gray-200 mt-2">
              {data.students.map((student) => (
                <li key={student.id} className="py-2">
                  <p className="font-semibold text-gray-800">ID: {student.id}</p>
                  <div className="pl-4">
                    {Object.keys(student)
                      .filter(key => key !== 'id' && key !== '__typename')
                      .map(key => (
                        <p key={key}>
                          <span className="font-medium capitalize">{key}:</span> {student[key]}
                        </p>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
        {/* 4. AÑADIMOS un texto de estado inicial */}
        {!data && !error && !loading && (
          <p className="text-gray-500">Selecciona los campos y haz clic en "Buscar".</p>
        )}
      </div>
    </div>
  );
}


// --- Componente Principal App (sin cambios) ---

export default function App() {
  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-center text-gray-800">
            Consultas API usando GraphQL
          </h1>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <PokemonQueryComponent />
          <StudentsQueryComponent />
        </main>
      </div>
    </div>
  );
}

