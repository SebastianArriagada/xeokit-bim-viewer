import {math, ContextMenu} from "@xeokit/xeokit-sdk/dist/xeokit-sdk.es.js";

const tempVec3 = math.vec3();

/**
 * @private
 */
class TreeViewContextMenu extends ContextMenu {

    constructor(bimViewer) {
        super();
        this._bimViewer = bimViewer;
        this._buildMenu();
    }

    _buildMenu() {

        const focusObjectItems = [];

        if (this._bimViewer._enableQueryObjects) {
            focusObjectItems.push({
                getTitle: (context) => {
                    return context.viewer.localeService.translate("objectContextMenu.showProperties") || "Show Properties";
                },
                doAction: (context) => {
                    context.bimViewer._queryTool.queryObject(context.treeViewNode.objectId);
                }
            });
        }

        focusObjectItems.push(...[
            {
                getTitle: (context) => {
                    return context.viewer.localeService.translate("treeViewContextMenu.viewFit") || "View Fit";
                },
                doAction: function (context) {
                    const viewer = context.viewer;
                    const scene = viewer.scene;
                    const objectIds = [];
                    context.treeViewPlugin.withNodeTree(context.treeViewNode, (treeViewNode) => {
                        if (treeViewNode.objectId) {
                            objectIds.push(treeViewNode.objectId);
                        }
                    });
                    scene.setObjectsVisible(objectIds, true);
                    scene.setObjectsHighlighted(objectIds, true);
                    const aabb = scene.getAABB(objectIds);
                    viewer.cameraFlight.flyTo({
                        aabb: aabb,
                        duration: 0.5
                    }, () => {
                        setTimeout(function () {
                            scene.setObjectsHighlighted(scene.highlightedObjectIds, false);
                        }, 500);
                    });
                    viewer.cameraControl.pivotPos = math.getAABB3Center(aabb);
                }
            },
            {
                getTitle: (context) => {
                    return context.viewer.localeService.translate("treeViewContextMenu.viewFitAll") || "View Fit All";
                },
                doAction: function (context) {
                    const viewer = context.viewer;
                    const scene = viewer.scene;
                    const sceneAABB = scene.getAABB(scene.visibleObjectIds);
                    viewer.cameraFlight.flyTo({
                        aabb: sceneAABB,
                        duration: 0.5
                    });
                    viewer.cameraControl.pivotPos = math.getAABB3Center(sceneAABB);
                }
            }
        ]);

        this.items = [
            focusObjectItems,
            [
                {
                    getTitle: (context) => {
                        return context.viewer.localeService.translate("treeViewContextMenu.isolate") || "Isolate";
                    },
                    doAction: function (context) {
                        const viewer = context.viewer;
                        const scene = viewer.scene;
                        const objectIds = [];
                        context.treeViewPlugin.withNodeTree(context.treeViewNode, (treeViewNode) => {
                            if (treeViewNode.objectId) {
                                objectIds.push(treeViewNode.objectId);
                            }
                        });
                        const aabb = scene.getAABB(objectIds);

                        viewer.cameraControl.pivotPos = math.getAABB3Center(aabb, tempVec3);

                        scene.setObjectsXRayed(scene.xrayedObjectIds, false);
                        scene.setObjectsVisible(scene.visibleObjectIds, false);
                        // scene.setObjectsPickable(scene.objectIds, false);
                        scene.setObjectsSelected(scene.selectedObjectIds, false);

                        scene.setObjectsVisible(objectIds, true);
                        // scene.setObjectsPickable(objectIds, true);

                        viewer.cameraFlight.flyTo({
                            aabb: aabb
                        }, () => {
                        });
                    }
                }
            ],
            [
                {
                    getTitle: (context) => {
                        return context.viewer.localeService.translate("treeViewContextMenu.hide") || "Hide";
                    },
                    doAction: function (context) {
                        context.treeViewPlugin.withNodeTree(context.treeViewNode, (treeViewNode) => {
                            if (treeViewNode.objectId) {
                                const entity = context.viewer.scene.objects[treeViewNode.objectId];
                                if (entity) {
                                    entity.visible = false;
                                }
                            }
                        });
                    }
                },
                {
                    getTitle: (context) => {
                        return context.viewer.localeService.translate("treeViewContextMenu.hideOthers") || "Hide Others";
                    },
                    doAction: function (context) {
                        const scene = context.viewer.scene;
                        scene.setObjectsVisible(scene.visibleObjectIds, false);
                        scene.setObjectsPickable(scene.xrayedObjectIds, true);
                        scene.setObjectsXRayed(scene.xrayedObjectIds, false);
                        context.treeViewPlugin.withNodeTree(context.treeViewNode, (treeViewNode) => {
                            if (treeViewNode.objectId) {
                                const entity = scene.objects[treeViewNode.objectId];
                                if (entity) {
                                    entity.visible = true;
                                }
                            }
                        });
                    }
                },
                {
                    getTitle: (context) => {
                        return context.viewer.localeService.translate("treeViewContextMenu.hideAll") || "Hide All";
                    },
                    getEnabled: function (context) {
                        return (context.viewer.scene.visibleObjectIds.length > 0);
                    },
                    doAction: function (context) {
                        context.viewer.scene.setObjectsVisible(context.viewer.scene.visibleObjectIds, false);
                    }
                }
            ],
            [
                {
                    getTitle: (context) => {
                        return context.viewer.localeService.translate("treeViewContextMenu.show") || "Show";
                    },
                    doAction: function (context) {
                        context.treeViewPlugin.withNodeTree(context.treeViewNode, (treeViewNode) => {
                            if (treeViewNode.objectId) {
                                const entity = context.viewer.scene.objects[treeViewNode.objectId];
                                if (entity) {
                                    entity.visible = true;
                                    if (entity.xrayed) {
                                        entity.pickable = true;
                                    }
                                    entity.xrayed = false;
                                    entity.selected = false;
                                }
                            }
                        });
                    }
                },
                {
                    getTitle: (context) => {
                        return context.viewer.localeService.translate("treeViewContextMenu.showOthers") || "Shows Others";
                    },
                    doAction: function (context) {
                        const scene = context.viewer.scene;
                        scene.setObjectsVisible(scene.objectIds, true);
                        scene.setObjectsPickable(scene.xrayedObjectIds, true);
                        scene.setObjectsXRayed(scene.xrayedObjectIds, false);
                        context.treeViewPlugin.withNodeTree(context.treeViewNode, (treeViewNode) => {
                            if (treeViewNode.objectId) {
                                const entity = scene.objects[treeViewNode.objectId];
                                if (entity) {
                                    entity.visible = false;
                                }
                            }
                        });
                    }
                },
                {
                    getTitle: (context) => {
                        return context.viewer.localeService.translate("treeViewContextMenu.showAll") || "Show All";
                    },
                    getEnabled: function (context) {
                        const scene = context.viewer.scene;
                        return ((scene.numVisibleObjects < scene.numObjects) || (context.viewer.scene.numXRayedObjects > 0));
                    },
                    doAction: function (context) {
                        const scene = context.viewer.scene;
                        scene.setObjectsVisible(scene.objectIds, true);
                        scene.setObjectsPickable(scene.xrayedObjectIds, true);
                        scene.setObjectsXRayed(scene.xrayedObjectIds, false);
                    }
                }
            ],
            [
                {
                    getTitle: (context) => {
                        return context.viewer.localeService.translate("treeViewContextMenu.xray") || "X-Ray";
                    },
                    doAction: function (context) {
                        context.treeViewPlugin.withNodeTree(context.treeViewNode, (treeViewNode) => {
                            if (treeViewNode.objectId) {
                                const entity = context.viewer.scene.objects[treeViewNode.objectId];
                                if (entity) {
                                    entity.selected = false;
                                    entity.xrayed = true;
                                    entity.visible = true;
                                    entity.pickable = false;
                                }
                            }
                        });
                    }
                },
                {
                    getTitle: (context) => {
                        return context.viewer.localeService.translate("treeViewContextMenu.undoXray") || "Undo X-Ray";
                    },
                    doAction: function (context) {
                        context.treeViewPlugin.withNodeTree(context.treeViewNode, (treeViewNode) => {
                            if (treeViewNode.objectId) {
                                const entity = context.viewer.scene.objects[treeViewNode.objectId];
                                if (entity) {
                                    entity.xrayed = false;
                                    entity.pickable = true;
                                }
                            }
                        });
                    }
                },
                {
                    getTitle: (context) => {
                        return context.viewer.localeService.translate("treeViewContextMenu.xrayOthers") || "X-Ray Others";
                    },
                    doAction: function (context) {
                        const scene = context.viewer.scene;
                        scene.setObjectsVisible(scene.objectIds, true);
                        scene.setObjectsPickable(scene.objectIds, false);
                        scene.setObjectsXRayed(scene.objectIds, true);
                        scene.setObjectsSelected(scene.selectedObjectIds, false);
                        context.treeViewPlugin.withNodeTree(context.treeViewNode, (treeViewNode) => {
                            if (treeViewNode.objectId) {
                                const entity = scene.objects[treeViewNode.objectId];
                                if (entity) {
                                    entity.xrayed = false;
                                    entity.pickable = true;
                                }
                            }
                        });
                    }
                },
                {
                    getTitle: (context) => {
                        return context.viewer.localeService.translate("treeViewContextMenu.xrayAll") || "X-Ray All";
                    },
                    doAction: function (context) {
                        const scene = context.viewer.scene;
                        scene.setObjectsVisible(scene.objectIds, true);
                        scene.setObjectsXRayed(scene.objectIds, true);
                        scene.setObjectsSelected(scene.selectedObjectIds, false);
                        scene.setObjectsPickable(scene.objectIds, false);
                    }
                },
                {
                    getTitle: (context) => {
                        return context.viewer.localeService.translate("treeViewContextMenu.xrayNone") || "X-Ray None";
                    },
                    getEnabled: function (context) {
                        return (context.viewer.scene.numXRayedObjects > 0);
                    },
                    doAction: function (context) {
                        const scene = context.viewer.scene;
                        const xrayedObjectIds = scene.xrayedObjectIds;
                        scene.setObjectsPickable(xrayedObjectIds, true);
                        scene.setObjectsXRayed(xrayedObjectIds, false);
                    }
                }
            ],
            [
                {
                    getTitle: (context) => {
                        return context.viewer.localeService.translate("treeViewContextMenu.select") || "Select";
                    },
                    doAction: function (context) {
                        context.treeViewPlugin.withNodeTree(context.treeViewNode, (treeViewNode) => {
                            if (treeViewNode.objectId) {
                                const entity = context.viewer.scene.objects[treeViewNode.objectId];
                                if (entity) {
                                    entity.selected = true;
                                    entity.visible = true;
                                }
                            }
                        });
                    }
                },
                {
                    getTitle: (context) => {
                        return context.viewer.localeService.translate("treeViewContextMenu.undoSelect") || "Undo Select";
                    },
                    doAction: function (context) {
                        context.treeViewPlugin.withNodeTree(context.treeViewNode, (treeViewNode) => {
                            if (treeViewNode.objectId) {
                                const entity = context.viewer.scene.objects[treeViewNode.objectId];
                                if (entity) {
                                    entity.selected = false;
                                }
                            }
                        });
                    }
                },
                {
                    getTitle: (context) => {
                        return context.viewer.localeService.translate("treeViewContextMenu.selectNone") || "Select None";
                    },
                    getEnabled: function (context) {
                        return (context.viewer.scene.numSelectedObjects > 0);
                    },
                    doAction: function (context) {
                        context.viewer.scene.setObjectsSelected(context.viewer.scene.selectedObjectIds, false);
                    }
                }
            ],
            [
                {
                    getTitle: (context) => {
                        return context.viewer.localeService.translate("treeViewContextMenu.clearSlices") || "Clear Slices";
                    },
                    getEnabled: function (context) {
                        return (context.bimViewer.getNumSections() > 0);
                    },
                    doAction: function (context) {
                        context.bimViewer.clearSections();
                    }
                }]
        ];
    }
}

export {TreeViewContextMenu};