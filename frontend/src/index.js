import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client';

// 1. Configuración de Apollo Client
//    Apunta a la URL donde se está ejecutando tu backend de Python.
const client = new ApolloClient({
  uri: '/graphql',
  cache: new InMemoryCache(),
});

// 2. Obtener el elemento raíz del DOM
const rootElement = document.getElementById('root');
const root = ReactDOM.createRoot(rootElement);

// 3. Renderizar la aplicación
//    Envolvemos toda la <App> con <ApolloProvider> para que
//    cualquier componente dentro de App pueda hacer consultas GraphQL.
root.render(
  <React.StrictMode>
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
  </React.StrictMode>
);
