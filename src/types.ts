import {IconName} from "@fortawesome/fontawesome-svg-core";

export type TStringResolver = ((record?: any) => string);

export interface ISiteMapEntryBreadcrumbs {
    label: string;
    to?: string;
    order?: number;
}

export interface ISiteMapEntry {
    code                : string;
    isMainMenuEntry?    : boolean;
    isUserMenuEntry?    : boolean;
    isNavigationEntry?  : boolean;
    exact?              : boolean;
    permissionCodes     : string[];
    label               : TStringResolver;
    iconName?           : IconName | string;
    to                  : TStringResolver;
    onClick?            : Function;
    children?           : ISiteMapEntry[];
    path                : string | string[];
    breadcrumbs?        : (contextData?: any) => ISiteMapEntryBreadcrumbs[];
}

export type SiteMapGenerator = (() => ISiteMapEntryGenerator[]);

export interface ISiteMapEntryGenerator extends Omit<ISiteMapEntry, 'children' | 'to' | 'label' | 'permissions' | 'path'> {
    label?          : TStringResolver | string;
    to?             : TStringResolver | string;
    children?       : SiteMapGenerator | SiteMapGenerator[];
    path?           : string | string[];
    permissions?    : string[];
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