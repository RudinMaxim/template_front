const fs = require('fs');
const path = require('path');
const { askQuestion } = require('../gitflow/prompts');

const componentTypes = ['entity', 'feature', 'page', 'ui', 'widget'];

function createDirectory(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function createFile(filePath, content) {
  fs.writeFileSync(filePath, content);
}

function isPascalCase(str) {
  return /^[A-Z][a-zA-Z0-9]*$/.test(str);
}

function isCamelCase(str) {
  return /^[a-z][a-zA-Z0-9]*$/.test(str);
}

function isUpperSnakeCase(str) {
  return /^[A-Z][A-Z0-9_]*$/.test(str);
}

function isKebabCase(str) {
  return /^[a-z][a-z0-9-]*$/.test(str);
}

async function validateComponentName(name) {
  if (!isPascalCase(name)) {
    console.log('Ошибка: Имя компонента должно быть в PascalCase.');
    return false;
  }
  return true;
}

async function validateUtilName(name) {
  if (!isCamelCase(name)) {
    console.log('Ошибка: Имя утилиты должно быть в camelCase.');
    return false;
  }
  return true;
}

async function validateConstantName(name) {
  if (!isUpperSnakeCase(name)) {
    console.log('Ошибка: Имя константы должно быть в UPPER_SNAKE_CASE.');
    return false;
  }
  return true;
}

async function validateCssClassName(name) {
  if (!isKebabCase(name)) {
    console.log('Ошибка: CSS класс должен быть в kebab-case.');
    return false;
  }
  return true;
}

function updateRootIndexFile(type, componentName) {
  const rootIndexPaths = {
    entity: path.join('src', 'entities', 'index.ts'),
    feature: path.join('src', 'features', 'index.ts'),
    ui: path.join('src', 'shared', 'ui', 'index.ts'),
    widget: path.join('src', 'widgets', 'index.ts'),
  };

  const rootIndexPath = rootIndexPaths[type];
  if (!rootIndexPath) return;

  let content = fs.existsSync(rootIndexPath) ? fs.readFileSync(rootIndexPath, 'utf8') : '';

  const exportStatement = `export * from './${componentName}';\n`;
  if (!content.includes(exportStatement)) {
    content += exportStatement;
    fs.writeFileSync(rootIndexPath, content);
  }
}

async function generateEntity(entityName) {
  const entityPath = path.join('src', 'entities', entityName);

  if (fs.existsSync(entityPath)) {
    console.log(`Сущность ${entityName} уже существует.`);
    return;
  }

  createDirectory(entityPath);

  const modelContent = `export interface I${entityName} {
  id: string;
  // Добавьте другие свойства здесь
}

export const ${entityName.toLowerCase()}Initial: I${entityName} = {
  id: '',
  // Инициализируйте другие свойства здесь
};
`;
  createFile(path.join(entityPath, 'model.ts'), modelContent);

  const componentContent = `import React from 'react';
import { I${entityName} } from './model';
import { use${entityName}List } from './use${entityName}List';

interface I${entityName}ListProps {
  // Определите пропсы здесь, если необходимо
}

export function ${entityName}List({}: I${entityName}ListProps) {
  const { items } = use${entityName}List();

  return (
    <div>
      <h2>${entityName} List</h2>
      <ul>
        {items.map((item) => (
          <li key={item.id}>{item.id}</li>
        ))}
      </ul>
    </div>
  );
}
`;
  createFile(path.join(entityPath, `${entityName}List.tsx`), componentContent);

  const hookContent = `import { I${entityName} } from './model';

interface I${entityName}ListHookResult {
  items: I${entityName}[];
}

export function use${entityName}List(): I${entityName}ListHookResult {
  // Здесь логика для получения и обработки списка сущностей
  const items: I${entityName}[] = [];
  return { items };
}
`;
  createFile(path.join(entityPath, `use${entityName}List.ts`), hookContent);

  const indexContent = `export * from './model';
export * from './${entityName}List';
`;
  createFile(path.join(entityPath, 'index.ts'), indexContent);

  updateRootIndexFile('entity', entityName);
  console.log(`Сущность ${entityName} успешно создана.`);
}

async function generateFeature(featureName) {
  const featurePath = path.join('src', 'features', featureName);

  if (fs.existsSync(featurePath)) {
    console.log(`Фича ${featureName} уже существует.`);
    return;
  }

  createDirectory(featurePath);

  const featureContent = `import React from 'react';
import { use${featureName} } from './use${featureName}';

interface I${featureName}Props {
  // Определите пропсы здесь, если необходимо
}

export function ${featureName}({}: I${featureName}Props) {
  const { handleSomeAction } = use${featureName}();

  return (
    <div>
      <h2>${featureName} Feature</h2>
      <button onClick={handleSomeAction}>Perform Action</button>
    </div>
  );
}
`;
  createFile(path.join(featurePath, `${featureName}.tsx`), featureContent);

  const hookContent = `interface I${featureName}HookResult {
  handleSomeAction: () => void;
}

export function use${featureName}(): I${featureName}HookResult {
  const handleSomeAction = () => {
    // Добавьте логику действия здесь
  };

  return { handleSomeAction };
}
`;
  createFile(path.join(featurePath, `use${featureName}.ts`), hookContent);

  const modelContent = `export interface I${featureName}State {
  // Определите состояние фичи здесь
}

export const ${featureName.toLowerCase()}Initial: I${featureName}State = {
  // Инициализируйте начальное состояние здесь
};
`;
  createFile(path.join(featurePath, 'model.ts'), modelContent);

  const indexContent = `export * from './${featureName}';
export * from './model';
`;
  createFile(path.join(featurePath, 'index.ts'), indexContent);

  updateRootIndexFile('feature', featureName);
  console.log(`Фича ${featureName} успешно создана.`);
}

async function generatePage(route) {
  const segments = route.split('/').filter(Boolean);
  let currentPath = path.join('src', 'app', '(page)');

  for (const segment of segments) {
    currentPath = path.join(currentPath, segment);
    createDirectory(currentPath);
  }

  const pagePath = path.join(currentPath, 'page.tsx');

  if (fs.existsSync(pagePath)) {
    console.log(`Страница ${route} уже существует.`);
    return;
  }

  const pageContent = `import React from 'react';
import { Metadata } from 'next';
import { getMetadata } from '@/shared/helpers';

export const metadata: Metadata = getMetadata({});

export function ${segments[segments.length - 1]}Page() {
  return (
    <main>
      <h1>${segments[segments.length - 1]} Page</h1>
    </main>
  );
}
`;
  createFile(pagePath, pageContent);

  console.log(`Страница ${route} успешно создана.`);
}

async function generateUIComponent(type, name) {
  const baseDir = path.join('src', type === 'ui' ? 'shared/ui' : 'widgets', name);

  if (fs.existsSync(baseDir)) {
    console.log(`Компонент ${name} уже существует. Пожалуйста, выберите другое имя.`);
    return;
  }

  createDirectory(baseDir);

  const componentContent = `import React from 'react';
import styles from './${name}.module.scss';
import { use${name} } from './use${name}';

interface I${name}Props {
  // Определите пропсы здесь
}

export function ${name}({}: I${name}Props) {
  const {} = use${name}();

  return (
    <div className={styles.root}>
      <h2>${name}</h2>
      {/* Добавьте содержимое компонента здесь */}
    </div>
  );
}
`;
  createFile(path.join(baseDir, `${name}.tsx`), componentContent);

  const hookContent = `interface I${name}HookResult {
  // Определите возвращаемые значения хука здесь
}

export function use${name}(): I${name}HookResult {
  // Здесь логика компонента
  return {
    // Верните необходимые данные и функции
  };
}
`;
  createFile(path.join(baseDir, `use${name}.ts`), hookContent);

  const styleContent = `.root {
  // Добавьте базовые стили здесь
}
`;
  createFile(path.join(baseDir, `${name}.module.scss`), styleContent);

  const testContent = `import React from 'react';
import { render, screen } from '@testing-library/react';
import { ${name} } from './${name}';

describe('${name}', () => {
  it('renders correctly', () => {
    render(<${name} />);
    expect(screen.getByText('${name}')).toBeInTheDocument();
  });

  // Добавьте дополнительные тесты здесь
});
`;
  createFile(path.join(baseDir, `${name}.test.tsx`), testContent);

  const indexContent = `export * from './${name}';
`;
  createFile(path.join(baseDir, 'index.ts'), indexContent);

  updateRootIndexFile(type, name);
  console.log(`Компонент ${name} успешно создан в ${baseDir}`);
}

async function generateApiRoute(routeName) {
  const apiPath = path.join('src', 'app', 'api', routeName);
  createDirectory(apiPath);

  const routeContent = `import { NextRequest, NextResponse } from 'next/server';
  
  export async function GET(request: NextRequest) {
    // Логика для GET запроса
    return NextResponse.json({ message: 'GET request received' });
  }
  
  export async function POST(request: NextRequest) {
    // Логика для POST запроса
    const body = await request.json();
    return NextResponse.json({ message: 'POST request received', data: body });
  }
  
  export async function PUT(request: NextRequest) {
    // Логика для PUT запроса
    const body = await request.json();
    return NextResponse.json({ message: 'PUT request received', data: body });
  }
  
  export async function DELETE(request: NextRequest) {
    // Логика для DELETE запроса
    return NextResponse.json({ message: 'DELETE request received' });
  }
  `;

  createFile(path.join(apiPath, 'route.ts'), routeContent);
  console.log(`API route ${routeName} успешно создан.`);
}
async function promptUser() {
    const typeMap = {
      entity: { prompt: 'сущности', generator: generateEntity },
      feature: { prompt: 'фичи', generator: generateFeature },
      ui: { prompt: 'UI компонента', generator: generateUIComponent },
      widget: { prompt: 'виджета', generator: generateUIComponent },
      page: { prompt: 'страницы', generator: generatePage },
      api: { prompt: 'API route', generator: generateApiRoute },
    };
  
    const type = await askQuestion('Выберите тип компонента:', Object.keys(typeMap));
    
    if (type === 'page' || type === 'api') {
      const route = await askQuestion(`Введите маршрут для нового ${typeMap[type].prompt} (например, users или posts/[id]): `);
      await typeMap[type].generator(route);
    } else {
      let name;
      do {
        name = await askQuestion(`Введите имя ${typeMap[type].prompt}: `);
      } while (!(await validateComponentName(name)));
      
      await typeMap[type].generator(type === 'ui' || type === 'widget' ? type : name, name);
    }
  
    const createAnother = await askQuestion('Хотите создать еще один компонент?', ['Да', 'Нет']);
    if (createAnother === 'Да') {
      await promptUser();
    } else {
      console.log('Спасибо за использование генератора компонентов!');
    }
  }
  

console.log('Добро пожаловать в улучшенный генератор компонентов!');
promptUser();
