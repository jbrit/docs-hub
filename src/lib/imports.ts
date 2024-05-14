import dynamic from 'next/dynamic';
import type { ComponentType } from 'react';
import * as GQLExamples from '~/docs/fuel-graphql-docs/examples';
import * as FuelExamples from '~/docs/fuels-wallet/packages/docs/examples';
import * as nightlyGQLExamples from '~/docs/nightly/fuel-graphql-docs/examples';
import * as nightlyFuelExamples from '~/docs/nightly/fuels-wallet/packages/docs/examples';
import { TD, TH } from '~/src/components/Table';
import TestAction from '~/src/components/TestAction';
import { COMPONENTS as GQL_COMPONENTS } from '~/src/generated/components/graphql';
import { COMPONENTS as NIGHTLY_GQL_COMPONENTS } from '~/src/generated/components/nightly-graphql';
import { COMPONENTS as NIGHTLY_WALLET_COMPONENTS } from '~/src/generated/components/nightly-wallet';
import { COMPONENTS as WALLET_COMPONENTS } from '~/src/generated/components/wallet';

import type { ComponentsList, VersionSet } from '../types';

// biome-ignore lint/suspicious/noExplicitAny:
function loadComponent(imp: any, name?: string): ComponentType<object> {
  // biome-ignore lint/suspicious/noExplicitAny:
  return dynamic(() => imp.then((mod: any) => (name ? mod[name] : mod)), {
    ssr: false,
  });
}

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
type Component = React.ComponentType<any>;

export interface ComponentsObject {
  [key: string]:
    | Component
    | typeof GQLExamples
    | typeof FuelExamples
    | typeof nightlyGQLExamples
    | typeof nightlyFuelExamples;
}

export function getComponents(docSlug: string, versionSet: VersionSet) {
  const components: ComponentsObject = {};

  function addComponents(list: ComponentsList) {
    Object.keys(list).forEach((page) => {
      if (docSlug.includes(page)) {
        // biome-ignore lint/suspicious/noExplicitAny:
        list[page].forEach((comp: any) => {
          if (comp.import) {
            components[comp.name] = comp.import;
          } else if (comp.imports) {
            components[comp.name] = comp.imports;
          }
        });
      }
    });
  }

  if (docSlug.includes('guides/')) {
    components.TestAction = TestAction;
  } else if (docSlug.includes('/wallet/')) {
    components.td = TD;
    components.th = TH;

    if (versionSet === 'nightly') {
      components.Examples = nightlyFuelExamples;
      addComponents(NIGHTLY_WALLET_COMPONENTS);
    } else {
      components.Examples = FuelExamples;
      addComponents(WALLET_COMPONENTS);
    }
  } else if (docSlug.includes('/graphql/')) {
    if (versionSet === 'nightly') {
      components.GQLExamples = nightlyGQLExamples;
      addComponents(NIGHTLY_GQL_COMPONENTS);
    } else if (versionSet === 'beta-5') {
      components.GQLExamples = beta5GQLExamples;
      addComponents(BETA_5_GQL_COMPONENTS);
    } else {
      components.GQLExamples = GQLExamples;
      addComponents(GQL_COMPONENTS);
    }
    components.CodeExamples = loadComponent(
      import('~/src/components/GraphqlCodeExample'),
      'GraphQLCodeExample'
    );
  }

  return components;
}
