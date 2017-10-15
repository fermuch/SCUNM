const initState = require('../SCUNMEngine').initState;
function gameReset(game) {
	game.state.inventory = {};
	game.state.rooms = {};
	game.state.actors = {};
	initState(game);
}

module.exports.Demo = {
	meta: {
		name: 'Sirviente del Mal',
		authors: [ 'Fermuch' ],
		description: 'Historia basada en la Saga del Mal'
	},
	state: {
		currentRoom: 'Inicio',
		inventory: null,
		actors: {
			monedas: {
				collectible: true,
				visible: true,
			},
			puñal: {
				collectible: true,
			},
		}
	},
	// game assets
	globalResources: {
		actions: {
			youShallNotPass: {
				description: "“Ningún sirviente puede irse del castillo sin un permiso real.”"
			},
			princesaDialogoBuscarCaballo: {
				description: `
La princesa te cuenta sobre cómo en su última negociación puso en práctica sus habilidades de negociadora, consiguiendo que el reino vecino le entreguen un corcel blanco a cambio de una baja en los impuestos de importación y exportación.

Te indica que vayas a buscárselo.
Te entrega una “Solicitud Real del Corcel Real”
				`.replace(/^\s+|\s+$/g, '')
			},
			showPermission: {
				description: "* El guardia lee el permiso y te deja pasar."
			},
		},
		actors: {
			monedas: {
				name: 'Bolsa de Monedas',
				descriptions: {
					0: 'Una bolsa de cuero, con monedas de plata dentro.',
					// al gastar las monedas
					1: 'Una bolsa de cuero.'
				},
				images: {
					0: 'https://i.imgur.com/nYpefyn.gif'
				},
			},
			puñal: {
				name: 'Puñal',
				descriptions: {
					0: 'Un puñal. Nunca lo usaste, y esperás no necesitar hacerlo nunca.',
					// para cuando mate a miku
					1: 'Un puñal, rebañado en sangre de una inocente niña.'
				},
				images: {
					0: 'https://i.imgur.com/2egipsH.gif'
				},
			},
			permisoReal: {
				name: 'Solicitud Real del Corcel Real',
				descriptions: {
					0: `
Pergamino que detalla la “Solicitud Real del Corcel Real”, con la firma de la princesa, la cual es un conejito con un sombrero.
					`.replace(/^\s+|\s+$/g, '')
				},
				dar(game, secondActor) {
					console.info({game, secondActor});
					if (secondActor.id !== 'guard') {
						// Sólo el guardia puede recibir el permiso
						return;
					}
					// el guardia ya no bloquea más el paso
					secondActor.state.removed = true;
					game.roomGetCurrent().guardLeft();
					// game.inventoryRemoveItem(this);
					// diálogo del guardia
					return game.outPutCreateFromAction('showPermission');
				}
			}
		},
		//optional //default are ["give", "pick up", "use", "open", "look at", "push", "close", "talk to", "pull", "go", "inventory"];
		//verbs: ["jump", "go"]// optional; custom verbs; WARNING: overrides (does not combine with) default verbs
		//the engine provides handlers for default verbs, custom verbs requires custom handlers in globalCommands section.
		verbs: [
			"mirar", "agarrar", "ir", "dar", "hablar", "inventario"
		]
	},
	globalCommands: {
		ir(direction) {
			if (!direction) {
				return this.outPutCreateFromRoomExits('¿Dónde?', 'ir');
			}
			const destRoom = this.roomGetCurrent().exits[direction];
			if (!destRoom) {
				return this.outPutCreateRaw('No se puede ir hacia allí');
			}

			let outPut = this.ir ? this.ir(direction) : null;
			if (outPut) {
				return outPut;
			}

			const room = this.roomGetCurrent();
			outPut = room.ir ? room.ir(this, direction) : null;
			if (outPut) {
				return outPut;
			}

			this.roomSetCurrent(destRoom);
			return this.outPutCreateFromRoom(this.roomGetCurrent());
		},
		agarrar(actorId) {
			if (!actorId) {
				return this.outPutCreateFromRoomActors("¿Agarrar qué cosa?", 'agarrar');
			}

			let actor = this.actorGetFromCurrentRoom(actorId);
			if (!actor) {
				return this.outPutCreateRaw('No hay nada para agarrar.');
			}

			let outPut = this.agarrar ? this.agarrar(actor) : null;
			if (outPut) {
				return outPut;
			}

			const room = this.roomGetCurrent();
			outPut = room.agarrar ? room.agarrar(this, actor) : null;
			if (outPut) {
				return outPut;
			}

			outPut = actor.agarrar ? actor.agarrar(this) : null;
			if (outPut) {
				return outPut;
			}

			if (
				!actor.state.visible || actor.state.removed
			) {
				return this.outPutCreateRaw('No hay nada para agarrar.');
			}
			if (!actor.state.collectible) {
				return this.outPutCreateRaw('No puedes agarrar eso.');
			}
			this.inventoryAddItem(actor);
			actor.state.removed = true;
			return this.outPutCreateRaw('Agarraste: ' + actor.name);
		},
		// comando escondido para inspeccionar el inventario
		inspeccionar(itemId) {
			var item = this.actorGetFromInventory(itemId);
			if (!item) {
				return this.outPutCreateRaw('No veo eso en mi inventario.');
			}
			if (item) {
				return this.outPutCreateFromActor(item);
			}
		},
		inventario() {
			const outPut = this.outPutCreateFromInventory('Llevas estas cosas:', 'inspeccionar');
			if (outPut.selection.list.length === 0) {
				return this.outPutCreateRaw('Tus bolsillos están vacíos.');
			}
			return outPut;
		},
		hablar(actorId) {
			if (!actorId) {
				return this.outPutCreateFromRoomActors('¿A quién?', 'hablar');
			}
			const actor = this.actorGetFromCurrentRoom(actorId);
			if (!actor) {
				return this.outPutCreateRaw('Puedes intentar hablar, pero no te responderá.');
			}
			if (!actor.state.visible || actor.state.removed) {
				return this.outPutCreateRaw('Puedes intentar hablar, pero no te responderá.');
			}

			let outPut = this.hablar ? this.hablar(actor) : null;
			if (outPut) {
				return outPut;
			}

			const room = this.roomGetCurrent();
			outPut = room.hablar ? room.hablar(this, actor) : null;
			if (outPut) {
				return outPut;
			}

			outPut = actor.hablar ? actor.hablar(this) : null;
			if (outPut) {
				return outPut;
			}

			return this.outPutCreateRaw('Puedes intentar hablar a eso, pero no te responderá.');
		},
		dar(firstActorId, secondActorId) {
			if (!firstActorId) {
				const outPut = this.outPutCreateFromInventory('¿Qué cosa?', 'dar');
				if (outPut.selection.list.length === 0) {
					return this.outPutCreateRaw('Tus bolsillos están vacíos.');
				}
				return outPut;
			}
			const firstActor = this.actorGetFromInventory(firstActorId);

			if (firstActor) {
				if (!secondActorId) {
					return this.outPutCreateFromRoomActors(
						`Dar ${firstActor.name} a...`,
						`dar ${firstActor.id}`,
						true
					);
				}

				const secondActor = this.actorGetFromCurrentRoom(secondActorId);

				if (
					secondActor &&
					!secondActor.state.removed &&
					secondActor.state.visible
				) {
					let outPut = this.dar ? this.dar(firstActor, secondActor) : null;
					if (outPut) {
						return outPut;
					}

					const room = this.roomGetCurrent();
					outPut = room.dar ? room.usar(this, firstActor, secondActor) : null;
					if (outPut) {
						return outPut;
					}

					outPut = firstActor.dar ? firstActor.dar(this, secondActor) : null;
					if (outPut) {
						return outPut;
					}

					return this.outPutCreateRaw('No puedo dar eso.');
				}
			}
			return this.outPutCreateRaw('No puedo dar eso.');
		},
		mirar(actorId) {
			if (!actorId) {
				const room = this.roomGetCurrent();
				if (!room || !room.actors || Object.keys(room.actors).length === 0) {
					return this.outPutCreateRaw('No hay nada que mirar');
				}
				return this.outPutCreateFromRoomActors('¿Qué cosa?', 'mirar');
			}
			const actor = this.actorGetFromCurrentRoom(actorId);
			if (!actor) {
				return this.outPutCreateRaw('No llegas a ver eso');
			}
			if (
				!actor.state.visible ||
				actor.state.removed
			) {
				return this.outPutCreateRaw('No llegas a ver eso');
			}

			let outPut = this.mirar ? this.mirar(actor) : null;
			if (outPut) {
				return outPut;
			}

			const room = this.roomGetCurrent();
			outPut = room.mirar ? room.mirar(this, actor) : null;
			if (outPut) {
				return outPut;
			}

			outPut = actor.mirar ? actor.mirar(this) : null;
			if (outPut) {
				return outPut;
			}

			return this.outPutCreateFromActor(actor);
		}
	},
	rooms: {
		Inicio: {
			name: "Inicio",
			descriptions: {
				0: `
Érase una vez un reino, construido por un sabio rey, quien dedicó su vida a la mejoría de su reinado.
Fue en temprana edad que el rey falleció, preso de una extraña enfermedad, dejando a la reina, hermosa como ninguna y de voz suave y dulce, como cabecera del reino.
El único deseo de la reina era el de continuar el legado de su rey, y crear una nación próspera para sus habitantes. Su reinado fue justo y próspero, pero corto. Ella también sufrió de la misma enfermedad que su esposo, llevándosela de sus tierras a una temprana edad.

Y la corona pasó a la princesa, quien era bonita como capullo de flor brotando al amanecer. Pero su carácter era el polo opuesto a su belleza: Era temperalmenta, le gustaba rodearse de lujos, y aplicaba reglas injustas a los habitantes del reinado. Todos los sirvientes tenían recelo y desprecio hacia ella, excepto uno: su más fiel sirviente. Él lucía igual a ella, ambos nacieron el mismo año, y su corazón le pertenecía a su reina.
No existía deseo de su reina que él no esté dispuesto a hacerlo realidad.

El reinado de la princesa era lejano al de sus padres, donde la tiranía de la princesa hizo que fuera condecorada como "La Hija del Mal", y sus tierras fueron llamadas como "El Reinado del Mal".

Tú, jugador, interpretarás el papel del Sirviente.
				`.replace(/^\s+|\s+$/g, '')
			},
			images: {
				0: 'https://i.imgur.com/oz9iMx1.gif'
			},
			exits: {
				Castillo: "Castillo",
			}
		},
		Castillo: {
			name: "Castillo",
			descriptions: {
				0: `
Estás en el castillo, lugar donde vive y reina tu Princesa.
Un guardia protege la entrada y salida del castillo.

Puedes ir a tus aposentos, a la habitación de la princesa, el trono de la princesa, o fuera del castillo.
				`.replace(/^\s+|\s+$/g, ''),
				1: `
Estás en el castillo, lugar donde vive y reina tu Princesa.

Puedes ir a tus aposentos, a la habitación de la princesa, el trono de la princesa, o fuera del castillo.
				`.replace(/^\s+|\s+$/g, ''),
			},
			images: {
				0: 'https://i.imgur.com/1NVy5m0.gif'
			},
			guardLeft() {
				this.state.descriptionIndex = 1;
			},
			actors: {
				guard: {
					name: "Guardia",
					descriptions: {
						0: 'Un guardia, armado con un hacha de casi el mismo tamaño que tu cuerpo, protege la salida y entrada al castillo.'
					},
					images: {
						0: "http://www.animated-gifs.eu/category_war/war-old/erzherzog_siegmund_kb_ha.gif"
					},
					state: {
						visible: true,
						removed: false
					},
					hablar(game) {
						return game.outPutCreateFromAction('youShallNotPass');
					}
				}
			},
			exits: {
				'Tus Aposentos': 'Aposentos',
				'Habitación Real': 'HabitacionReal',
				'Trono Real': 'TronoReal',
				'Afueras': 'Afueras'
			},
			// no permitir salir a menos que tenga un permiso para salir
			ir(game, direction) {
				if (direction === 'Afueras') {
					if (!game.actorGetFromCurrentRoom('guard').state.removed) {
						return game.outPutCreateFromAction('youShallNotPass');
					}
				}
			}
		},
		Aposentos: {
			name: 'Aposentos',
			descriptions: {
				0: `
Estás en tus aposentos. No disfrutas de lujos como aquellos con los que cuenta la habitación de la princesa, pero aún así te sientes alegre de poder compartir el mismo techo que ella.

Al lado de tu cama hay algunos objetos.
				`.replace(/^\s+|\s+$/g, ''),
				// después de agarrar los objetos, ya no hay nada
				1: 'Estás en tus aposentos. No disfrutas de lujos como aquellos con los que cuenta la habitación de la princesa, pero aún así te sientes alegre de poder compartir el mismo techo que ella.'
			},
			images: {
				0: 'https://i.imgur.com/CTOfNV8.gif',
			},
			exits: {
				'Volver atrás': 'Castillo'
			},
			agarrar(game) {
				// al agarrar todos los items, sacar el mensaje de que hay objetos disponibles
				const room = game.roomGetCurrent();
				const actors = [];
				for (let key in room.actors) {
					actors.push(room.actors[key]);
				}
				const totalTaken = actors.filter((a) => a.state.removed).length + 1;
				if (totalTaken === 2) {
					room.state.descriptionIndex = 1;
				}
			},
			actors: {
				monedas: {
					inventoryActor: "monedas",
					name: 'Bolsa de Monedas',
					descriptions: {
						0: 'Podrán no ser muchas monedas, pero son los ahorros de toda tu vida, y estás orgulloso del esfuerzo que pusiste en conseguir todas y cada una de ellas.',
					},
					images: {
						0: 'https://i.imgur.com/nYpefyn.gif'
					}
				},
				puñal: {
					inventoryActor: "puñal",
					name: 'Puñal',
					descriptions: {
						0: 'La cólera del pueblo es cada día más notorio, y nunca sabes cuándo puede ser necesario defenderte a tí mismo. Puede ser buena idea mantenerlo siempre cerca tuyo.',
					},
					images: {
						0: 'https://i.imgur.com/2egipsH.gif'
					}
				},
			},
		},
		HabitacionReal: {
			name: 'Habitación Real',
			descriptions: {
				0: `
La habitación de la princesa. Posiblemente la sala más lujuriosa del castillo.

La princesa no parece encontrarse aquí.
					`.replace(/^\s+|\s+$/g, '')
			},
			images: {
				0: 'https://i.imgur.com/morvoeY.gif'
			},
			exits: {
				'Volver atrás': 'Castillo'
			}
		},
		TronoReal: {
			name: 'Trono Real',
			descriptions: {
				0: `
El trono de la Princesa, lugar donde dictamina sus normas y leyes, y toma decisiones en nombre del reino.

La princesa está sentada en el tromo, y te hace un gesto con las manos de que te acerques a ella.
					`.replace(/^\s+|\s+$/g, '')
			},
			images: {
				0: 'https://i.imgur.com/VrVcwyX.gif'
			},
			ir(game) {
				const permisoReal = game.actorGetFromInventory('permisoReal');
				if (!permisoReal) {
					return game.outPutCreateRaw('Insolente! Cómo te atreves a desobedecer a tu princesa!');
				}
			},
			exits: {
				'Volver atrás': 'Castillo'
			},
			actors: {
				princesa: {
					name: 'Princesa',
					descriptions: {
						0: 'La princesa, simplemente la imagen de la perfección.'
					},
					images: {
						0: "https://i.imgur.com/AutgL1V.gif"
					},
					state: {
						visible: true,
						removed: false,
					},
					hablar(game) {
						const princesa = game.actorGetFromCurrentRoom('princesa').state;
						if (!princesa.alreadyAcceptedPermission) {
							princesa.alreadyAcceptedPermission = true;
							game.inventoryAddItem({
								...game.actorGetFromGlobal('permisoReal'),
								inventoryActor: 'permisoReal'
							});
							return game.outPutCreateFromAction('princesaDialogoBuscarCaballo');
						}

						return game.outPutCreateRaw('La princesa está muy ocupada como para responder a tus necesidades ahora.');
					},
				}
			}
		},
		Afueras: {
			name: 'Afueras del Castillo',
			descriptions: {
				0: `
Fuera del castillo, todo se ve triste y desolado.
Es notorio cómo el país está decayendo.






   ~~~ ¡FIN DEL DEMO! ~~~
(≧▽≦) GRACIAS POR JUGAR (≧▽≦)

(si querés volver a empezar, hablá con la bruja)
					`.replace(/^\s+|\s+$/g, '')
			},
			images: {
				0: 'https://i.imgur.com/tBEEs9U.gif'
			},
			actors: {
				bruja: {
					name: 'Bruja',
					descriptions: {
						0: 'Una bruja. Con verrugas y todo.'
					},
					state: {
						visible: true,
						removed: false,
					},
					hablar(game) {
						gameReset(game);
						game.roomSetCurrent('Inicio');
						return game.outPutCreateFromRoom(game.roomGetCurrent());
					},
				}
			}
			// exits: {
			// 	'Volver atrás': 'Castillo'
			// }
		},
	}
};