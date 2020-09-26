import {
    ISiteMapEntry,
    SiteMap,
    IndexedSiteMap,
    ISiteMapEntryGenerator,
    SiteMapGenerator,
    IInitSiteMap
} from "./types";

interface GenerateSiteMapOptions {
    breadCrumbsOrder?: number;
    parentRouteNode?: ISiteMapEntryGenerator;
}

export function generateSiteMap(routeGenerators: SiteMapGenerator[], options: GenerateSiteMapOptions = {}): SiteMap {

    let {parentRouteNode, breadCrumbsOrder = 0} = options;

    return routeGenerators.reduce((_, generateRouteNodes) => {

        const generatedRoutes = generateRouteNodes();

        _.push(...generatedRoutes
            .map(generatedRoute => {

                const {
                    to = "", path = parentRouteNode ? parentRouteNode.path : "", label = "", children, permissions = [],
                    breadcrumbs, ...other
                } = generatedRoute;

                const resolvedRoute = {
                    ...other,
                    to: data => typeof to === "function" ? to(data) : to,
                    label: data => typeof label === "function" ? label(data) : label,
                    breadcrumbs: contextData => breadcrumbs(contextData).map((breadcrumbItem) => {
                        return {
                            order: breadCrumbsOrder + 1,
                            ...breadcrumbItem
                        };
                    }),
                    path,
                    permissions : [
                        ...(parentRouteNode ? parentRouteNode.permissions : []),
                        ...permissions
                    ]
                };

                const childrenGenerators = Array.isArray(generatedRoute.children) ?
                    generatedRoute.children : [];

                if(typeof generatedRoute.children === "function") {
                    childrenGenerators.push(generatedRoute.children);
                }

                return Object.assign(resolvedRoute, {
                    children : childrenGenerators.length > 0 ?
                        generateSiteMap(childrenGenerators, {
                            parentRouteNode: resolvedRoute,
                            breadCrumbsOrder: breadCrumbsOrder + 1
                        }) : []
                });
            }));

        return _;
    }, []);
}

export function getIndexedSiteMap<T extends string>(siteMap: SiteMap): IndexedSiteMap<T> {
    let routeTreeIndex = {} as IndexedSiteMap<T>;

    const handleEntriesRecursively = (routeTreeEntries: ISiteMapEntry[], parentCode?: string) => {
        routeTreeEntries.forEach(routeTreeEntry => {

            if(!routeTreeIndex.hasOwnProperty(routeTreeEntry.code)) {
                const {children, ...routeTreeEntryProps} = routeTreeEntry;

                routeTreeIndex[routeTreeEntryProps.code as string] = {
                    ...routeTreeEntryProps,
                    parentCode
                };

                if(Array.isArray(children) && children.length > 0) {
                    handleEntriesRecursively(children, routeTreeEntryProps.code)
                }

            }

        });
    };
    handleEntriesRecursively(siteMap);

    return routeTreeIndex;
}

export function initSiteMap<T extends string>(routeGenerators: SiteMapGenerator[]): IInitSiteMap<T> {

    const siteMap = generateSiteMap(routeGenerators);

    return {
        siteMap,
        indexedSiteMap: getIndexedSiteMap<T>(siteMap)
    }
}

export * from "./types";