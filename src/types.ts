import {IconName} from "@fortawesome/fontawesome-svg-core";

export type TStringResolver = ((record?: any) => string);

export interface ISiteMapEntryBreadcrumbs {
    label: string;
    to?: string;
}

export interface ISiteMapEntry {
    code                : string;
    isMainMenuEntry?    : boolean;
    isUserMenuEntry?    : boolean;
    isNavigationEntry?  : boolean;
    exact?              : boolean;
    permissions         : string[];
    label               : TStringResolver;
    iconName?           : IconName | string;
    to?                 : TStringResolver;
    onClick?            : Function;
    children?           : ISiteMapEntry[];
    path                : string | string[];
    defaultBreadcrumbs? : ISiteMapEntryBreadcrumbs[]
}

export type SiteMapGenerator = (() => ISiteMapEntryGenerator[]);

export interface ISiteMapEntryGenerator extends Omit<ISiteMapEntry, 'children'> {
    children?       : SiteMapGenerator | SiteMapGenerator[]
}

export type SiteMap = ISiteMapEntry[];

export interface IIndexedSiteMapEntry extends Omit<ISiteMapEntry, 'children'> {
    parentCode      : string;
}

export type IndexedSiteMap<T extends string> = {[routeCode in T] : IIndexedSiteMapEntry};

export interface IInitSiteMap<T extends string> {
    siteMap: SiteMap;
    indexedSiteMap: IndexedSiteMap<T>;
}