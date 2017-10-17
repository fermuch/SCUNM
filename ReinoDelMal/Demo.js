const initState = require('../SCUNMEngine').initState;
function gameReset(game) {
	game.state.inventory = {};
	game.state.rooms = {};
	game.state.actors = {};
	initState(game);
}

function badEndFormatter(text = '') {
	return `${text}

~~ BAD END ~~

(Para volver a jugar, escribe “/restart”)
	`.replace(/^\s+|\s+$/g, '')
}

function visibleActors(actors) {
	if (!actors) {
		return [];
	}
	return Object.keys(actors).map((actorKey) => {
		const actor = actors[actorKey];
		if (
			actor && actor.state &&
			actor.state.visible &&
			!actor.state.removed
		) {
			return actor;
		}
	}).filter((actor) => actor);
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
					1: 'Una bolsa de cuero, con monedas de plata y una aeroventila.',
					2: 'Una bolsa de cuero, con monedas de plata y dos aeroventilas.',
					3: 'Una bolsa de cuero, con monedas de plata y tres aeroventilas.',
					4: 'Una bolsa de cuero, con monedas de plata y muchas aeroventilas. Sufrió un terrible trauma con un puñal.',
				},
				images: {
					0: 'https://i.imgur.com/nYpefyn.gif'
				},
				usar(game, secondActor) {
					if (
						secondActor && secondActor.id === 'puñal'
					) {
						if (!secondActor.state.dentroDeBolsita) {
							secondActor.state.dentroDeBolsita = true;
							return game.outPutCreateRaw('Metes el puñal en la bolsita');
						} else {
							secondActor.state.dentroDeBolsita = false;
							return game.outPutCreateRaw('Sacas el puñal de la bolsita');
						}
					}

					if (
						secondActor && secondActor.id === 'monedas'
					) {
						return game.outPutCreateRaw(
							'Intentas, con todas tus fuerzas, meter la bolsita dentro de ella misma, ' + 
							'pero esta tarea prueba ser más difícil de lo que esperabas.'
						);
					}

					if (
						secondActor && secondActor.id === 'guard'
					) {
						return game.outPutCreateRaw(
							'¿Cómo usarías monedas con el guardia? ¿No estarás pensando en dárselas?'
						);
					}
				},
				dar(game, secondActor) {
					if (
						secondActor && secondActor.id === 'guard'
					) {
						game.inventoryRemoveItem(game.actorGetFromInventory('monedas'));
						return game.outPutCreateRaw(
							'Le das las monedas al guardia. Él inspecciona la cantidad y, acto seguido, ' +
							'acomoda el mango del hacha en un hueco que hay en el piso... Y baila de manera ' +
							'sensual con el hacha como si fuera una bailarina de caño.\n\n' +
							'Intentas aprovechar la oportunidad para escabullirte fuera del castillo, ' +
							'pero tus dudas sobre el por qué existe un hueco para apoyar hachas de esa forma ' +
							'te hace cuestionarte sobre la vida misma.\n' +
							'(También te preguntas si es un requerimiento para el puesto saber hacer esos ' +
							'movimientos, pero no te animas a preguntarlo)'
						);
					}
				}
			},
			puñal: {
				name: 'Puñal',
				descriptions: {
					0: 'Un puñal. Nunca lo usaste, y esperás no necesitar hacerlo nunca.',
					1: 'Un puñal. Tiene fragmentos de cuero.',
					// para cuando mate a miku
					2: 'Un puñal, rebañado en sangre de una inocente niña.'
				},
				images: {
					0: 'https://i.imgur.com/2egipsH.gif'
				},
				usar(game, secondActor) {
					if (
						secondActor && secondActor.id === 'monedas'
					) {
						const puñal = game.actorGetFromInventory('puñal');
						if (puñal.state.descriptionIndex === 0) {
							puñal.state.descriptionIndex = 1;
						}
						switch (secondActor.state.descriptionIndex) {
							case 0:
								secondActor.state.descriptionIndex = 1;
								return game.outPutCreateRaw('La bolsa se siente traicionada por tí.');
							case 1:
								secondActor.state.descriptionIndex = 2;
								return game.outPutCreateRaw('La bolsa ya no te dirige la mirada.');
							case 2:
								secondActor.state.descriptionIndex = 3;
								return game.outPutCreateRaw('La bolsa ha perdido la confianza en la humanidad.');
							case 3:
								secondActor.state.descriptionIndex = 4;
								return game.outPutCreateRaw('La bolsa ya no habla. Ya no come. Y todo es tu culpa.');
							default:
								return game.outPutCreateRaw('Hacerle más huecos a la bolsa... Haría que deje de ser una bolsa.');
						}
					}

					if (
						secondActor && secondActor.id === 'princesa'
					) {
						gameReset(game);
						game.roomSetCurrent('Inicio');
						return game.outPutCreateRaw(badEndFormatter(
							'Usas tu puñal para cortarle un mechón de pelo a la princesa, con el objetivo que ese mechón ' +
							'te acompañe en tu larga y solitaria jornada... Ella no parece molestarse, ' +
							'pero causas celos a un guardia de su escorta personal, ' +
							'y él, de manera espectacular, hace que el filo de su hacha ' +
							'atraviese tu cuello. Dicen que tienes unos segundos desde que te cortan la cabeza ' +
							'hasta que mueres, y tienen razón: Pasas tus últimos momentos de vida admirando la ' +
							'impresionante proeza del guardia para hacer un corte tan limpio.'
						));
					}

					const room = game.roomGetCurrent();
					if (
						secondActor.id === 'permisoReal' && room.id === 'TronoReal'
					) {
						gameReset(game);
						game.roomSetCurrent('Inicio');
						return game.outPutCreateRaw(badEndFormatter(
							'Acabaste de destrozar un documento oficial, en frente de tu princesa. ' +
							'¿Qué extraño pensamiento pasó por tu cabeza? ¿Qué creías que iba a suceder?\n\n' +
							'Eres encerrado en el calabozo, y mueres de inanición después del sexto día.'
						));
					}
					
					if (secondActor.id === 'permisoReal') {
						game.inventoryRemoveItem(secondActor);
						return game.outPutCreateRaw('Destrozas el documento.');
					}

					if (
						secondActor.id == 'guard'
					) {
						game.inventoryRemoveItem(game.actorGetFromInventory('puñal'));
						return game.outPutCreateRaw(
							'Con todas tus fuerzas intentas clavar el puñal en el guardia, pero su armadura ' +
							'es más dura que el metal de tu puñal, haciéndolo añicos.\n\n' +
							'El guardia se ríe de tí, haciéndote sentir muy mal contigo mismo y causándote ' +
							'problemas de autoestima.'
						);
					}
				},
				dar(game, secondActor) {
					if (
						secondActor && secondActor.id === 'guard'
					) {
						game.inventoryRemoveItem(game.actorGetFromInventory('puñal'));
						return game.outPutCreateRaw(
							'Le das el puñal al guardia. Él lo inspecciona detenidamente, y de la nada ¡le pega ' +
							'un mordisco!, quebrándolo en el acto. Se ríe en voz alta y te dice que con eso ' +
							'no podrías cortar siquiera el cuello de una doncella de gelatina, aunque, ' +
							'extrañamente, la gelatina no fue inventada aún, así que no tienes idea de qué ' +
							'te quiso decir, pero te lo dijo de forma tan seria que se lo crees.'
						);
					}
				}
			},
			permisoReal: {
				name: 'Solicitud Real del Corcel Real',
				descriptions: {
					0: `
Pergamino que detalla la “Solicitud Real del Corcel Real”, con la firma de la princesa, la cual es un conejito con un sombrero.
					`.replace(/^\s+|\s+$/g, '')
				},
				dar(game, secondActor) {
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
				},
				usar(game, secondActor) {
					if (secondActor && secondActor.id === 'guard') {
						// el guardia ya no bloquea más el paso
						secondActor.state.removed = true;
						game.roomGetCurrent().guardLeft();
						// game.inventoryRemoveItem(this);
						// diálogo del guardia
						return game.outPutCreateFromAction('showPermission');
					}

					const room = game.roomGetCurrent();
					if (
						secondActor && secondActor.id === 'puñal' && room.id === 'TronoReal'
					) {
						console.info(room);
						gameReset(game);
						game.roomSetCurrent('Inicio');
						return game.outPutCreateRaw(badEndFormatter(
							'La Princesa quiebra en lágrimas por no sentir suficiente afecto de tu parte, ' +
							'y acto seguido un guardia te corta a la mitad con su hacha.'
						));
					}
				}
			}
		},
		verbs: [
			'mirar', 'agarrar', 'ir',
			'dar', 'hablar', 'inventario',
			'usar'
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
			const room = this.roomGetCurrent();

			if (!actorId) {
				if (!room || !room.actors || Object.keys(room.actors).length === 0) {
					return this.outPutCreateRaw(
						'No hay nada para agarrar.\n' +
						'Te llenas los bolsillos de aire, aunque parece escapárcete. ' +
						'¿Existirán pantalones con bolsillos sellados al vacío?'
					);
				}
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

					return this.outPutCreateRaw('No puedes dar eso.');
				}
			}
			return this.outPutCreateRaw('No puedes dar eso.');
		},
		mirar(actorId) {
			if (!actorId) {
				const room = this.roomGetCurrent();
				if (!room || !room.actors || visibleActors(room.actors).length === 0) {
					return this.outPutCreateRaw('No hay nada que mirar');
				}
				return this.outPutCreateFromRoomActors('¿Qué cosa?', 'mirar');
			}
			const actor = this.actorGetFromCurrentRoom(actorId);
			if (!actor) {
				return this.outPutCreateRaw('No ves nada.');
			}
			if (
				!actor.state.visible ||
				actor.state.removed
			) {
				return this.outPutCreateRaw('No llegas a distinguir eso');
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
		},
		usar(firstActorId, secondActorId) {
			const nullActor = {
				id: "",
				doNotExist: true
			};

			const noObjectsErr = 'No tienes nada para usar.\nIntentas usar la magia de la amistad, pero no parece hacer nada.';

			let outPut;
			if (!firstActorId) {
				const room = this.roomGetCurrent();
				if (!room || !room.actors || Object.keys(room.actors).length === 0) {
					return this.outPutCreateRaw(noObjectsErr);
				}
				outPut = this.outPutCreateFromRoomActors('¿Usar qué cosa?', 'usar', true);
				if (!outPut.selection || !outPut.selection.list || outPut.selection.list.length < 1) {
					return this.outPutCreateRaw(noObjectsErr);
				}
				return outPut;
			}

			if (firstActorId === "inventory") {
				outPut = this.outPutCreateFromInventory('¿Usar qué cosa?', 'usar');
				if (outPut.selection.list.length === 0) {
					return this.outPutCreateRaw('Tienes los bolsillos vacíos');
				}
				return outPut;
			}

			var firstActor =
				this.actorGetFromCurrentRoom(firstActorId) || this.actorGetFromInventory(firstActorId);

			// el actor existe, no fue eliminado y es visible
			if (firstActor && !firstActor.state.removed && firstActor.state.visible) {
				outPut = this.usar ? this.usar(firstActor, nullActor) : null;
				if (outPut) {
					return outPut;
				}

				var room = this.roomGetCurrent();
				outPut = room.usar ? room.usar(this, firstActor, nullActor) : null;
				if (outPut) {
					return outPut;
				}

				outPut = firstActor.usar ? firstActor.usar(this, nullActor) : null;
				if (outPut) {
					return outPut;
				}

				// Si el primer objeto no da ningún efecto, se espera que el segundo objeto tenga
				// una utilidad (ej: "usar la botella con...")
				if (!secondActorId) {
					return this.outPutCreateFromRoomActors(
						`¿Usar ${firstActor.name} con qué?`, `usar ${firstActor.id}`, true
					);
				}

				if (secondActorId === "inventory") {
					// si se usa el inventario como segunda opción, abrir el inventario
					return this.outPutCreateFromInventory(
						`¿Usar ${firstActor.name} con qué?`, `usar ${firstActor.id}`
					);
				}

				// "usar botella en la fuente"
				var secondActor =
					this.actorGetFromCurrentRoom(secondActorId) || this.actorGetFromInventory(secondActorId);

				// el actor existe, no fue eliminado y es visible
				if (secondActor && !secondActor.state.removed && secondActor.state.visible) {
					outPut = this.usar ? this.usar(firstActor, secondActor) : null;
					if (outPut) {
						return outPut;
					}

					room = this.roomGetCurrent();
					outPut = room.usar ? room.usar(this, firstActor, secondActor) : null;
					if (outPut) {
						return outPut;
					}

					outPut = firstActor.usar ? firstActor.usar(this, secondActor) : null;
					if (outPut) {
						return outPut;
					}

					return this.outPutCreateRaw('No tienes la creatividad requerida para realizar esa acción.');
				}
			}

			return this.outPutCreateRaw('No puedo usarlo.');//can not find actor to use
		},
		async firmar() {
			const room = this.roomGetCurrent();
			if (room.id !== 'Afueras') {
				return this.outPutCreateRaw('¿Dónde se supone que quieres firmar?');
			}
			if (this.meta.store) {
				const store = this.meta.store.client;
				const jsonStore = this.meta.store;

				const firma = arguments['0'];
				// borrar comando (primer argumento)
				if (!firma || firma.length === 1) {
					return this.outPutCreateRaw('Para firmar... Necesitas una firma.');	
				}
				firma.shift();
				await store.lpush('ReinoDelMal:firmas', firma.join(' '));
				// sólo 5 firmas al mismo tiempo
				await store.ltrim('ReinoDelMal:firmas', 0, 4);

				return this.outPutCreateRaw('La bruja te dice: “he añadido tu firma a mi bola de cristal”');
			} else {
				return this.outPutCreateRaw('Te quedaste sin tinta mágica.');	
			}
		},
		async mensajesGlobales() {
			const store = this.meta.store.client;
			const jsonStore = this.meta.store;

			const keys = await store.lrange('ReinoDelMal:firmas', 0, 4);
			if (keys && keys.length) {
				const message = `
La bola de cristal dice...

${keys.map((k) => '~ ' + k).join('\n')}
				`.replace(/^\s+|\s+$/g, '');
				return this.outPutCreateRaw(message);
			} else {
				return this.outPutCreateRaw('“Aún nadie ha firmado en la bola de cristal...”');	
			}
		}
	},
	rooms: {
		Inicio: {
			name: "Inicio",
			descriptions: {
				0: `
Érase una vez un reino, construido por un sabio rey, que dedicó su vida a la mejoría de su reinado.
Fue en temprana edad que el rey falleció, preso de una extraña enfermedad, dejando a la reina, hermosa como ninguna y de voz suave y dulce, como cabecera del reino.
El único deseo de la reina era el de continuar el legado de su rey, y crear una nación próspera para sus habitantes. Su reinado fue justo y próspero, pero corto. Ella también sufrió de la misma enfermedad que su esposo, llevándosela de sus tierras a una temprana edad.

Y la corona pasó a la princesa, quien era bonita como capullo de flor brotando al amanecer. Pero su carácter era el polo opuesto a su belleza: Era temperamental, le gustaba rodearse de lujos, y aplicaba reglas injustas a los habitantes del reinado. Todos los sirvientes tenían recelo y desprecio hacia ella, excepto uno: su más fiel sirviente. Él lucía igual a ella, ambos nacieron el mismo año, y su corazón le pertenecía a su reina.
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
			},
			actors: {
				castillo: {
					name: 'Castillo',
					descriptions: {
						0: 'Un lujoso castillo.'
					},
					state: {
						visible: true,
						removed: false
					},
					agarrar(game) {
						return game.outPutCreateRaw('Lo intentas, pero es más pesado de lo que creías.');
					},
					usar(game) {
						return game.outPutCreateRaw(`
Intentas usar el castillo, pero... ¿Cómo usarías un castillo?

Dedicas unos minutos a reflexionar tal dilema, y llegas a la conclusión de que, si fuera de arena, podrías usarlo “pisoteándolo”.
Tristemente, este castillo no es pisoteable.
						`.replace(/^\s+|\s+$/g, ''));
					}
				}
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
					},
					agarrar(game) {
						return game.outPutCreateRaw(
							'Te acercas al guardia para agarrarlo y llevártelo, pero cuando clava su mirada en ' +
							'tí, te pones nervioso y rápidamente te acomodas el flequillo, y dices en voz alta que ' +
							'piensas que deberías cambiar de shampoo, pero después recuerdas que el shampoo ' +
							'aún no se inventó, mientras el guardia apronta su hacha. Sonríes y retrocedes ' +
							'lentamente.'
						);
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
			agarrar(game, item) {
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
				game.inventoryAddItem(item);
				item.state.removed = true;
				return game.outPutCreateRaw('Agarraste: ' + item.name);
			},
			actors: {
				monedasPieza: {
					inventoryActor: "monedas",
					name: 'Bolsa de Monedas',
					descriptions: {
						0: 'Podrán no ser muchas monedas, pero son los ahorros de toda tu vida, y estás orgulloso del esfuerzo que pusiste en conseguir todas y cada una de ellas.',
					},
					images: {
						0: 'https://i.imgur.com/nYpefyn.gif'
					}
				},
				puñalPieza: {
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
La habitación de la princesa. Posiblemente la sala más lujosa del castillo.

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

La princesa está sentada en el trono, y te hace un gesto con las manos de que te acerques a ella.
					`.replace(/^\s+|\s+$/g, '')
			},
			images: {
				0: 'https://i.imgur.com/VrVcwyX.gif'
			},
			ir(game) {
				const room = game.roomGetCurrent();
				const princesa = game.actorGetFromCurrentRoom('princesa').state;
				if (!princesa.alreadyAcceptedPermission) {
					switch(room.state.intentosDeEscaparse) {
						case 1:
							room.state.intentosDeEscaparse += 1;
							return game.outPutCreateRaw(
								'La Princesa empieza a notar cómo no quieres hablar con ella'
							);
						case 2:
							room.state.intentosDeEscaparse += 1;
							return game.outPutCreateRaw(
								'La Princesa hace una mueca de tristeza'
							);
						case 3:
							room.state.intentosDeEscaparse += 1;
							return game.outPutCreateRaw(
								'“¡VETE! ¡NO TE NECESITO!”, grita la Princesa.'
							);
						case 4:
							gameReset(game);
							game.roomSetCurrent('Inicio');
							return game.outPutCreateRaw(badEndFormatter(
								'La Princesa quiebra en lágrimas por no sentir suficiente afecto de tu parte, ' +
								'y acto seguido un guardia te corta a la mitad con su hacha.'
							));
						default:
							room.state.intentosDeEscaparse = (room.state.intentosDeEscaparse || 0) + 1;
					}
				}

				if (!princesa.alreadyAcceptedPermission) {
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
						princesa.timesTalkedTo += 1;
						if (!princesa.alreadyAcceptedPermission) {
							princesa.alreadyAcceptedPermission = true;
							game.inventoryAddItem({
								...game.actorGetFromGlobal('permisoReal'),
								inventoryActor: 'permisoReal'
							});
							return game.outPutCreateFromAction('princesaDialogoBuscarCaballo');
						}

						if (princesa.timesTalkedTo == 3) {
							// le jodiste demasiado a la princesa
							return game.outPutCreateRaw(`
¡Len! ¡Para ya! ¡Me tienes harta!
¡¡Ve y trae mi jodido corcel!!
							`.replace(/^\s+|\s+$/g, ''))
						}
						if (princesa.timesTalkedTo > 3) {
							// ahora te mata por vivo
							gameReset(game);
							game.roomSetCurrent('Inicio');
							return game.outPutCreateRaw(badEndFormatter(`
La princesa no soportó más tu insistencia y ordenó colgarte.
							`.replace(/^\s+|\s+$/g, '')));
						}
						
						

						return game.outPutCreateRaw('La princesa está muy ocupada como para responder a tus necesidades ahora.');
					},
				}
			}
		},
		Afueras: {
			name: 'Pueblo',
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
					async hablar(game) {
						if (game.meta.store) {
							const store = game.meta.store.client;
							const jsonStore = game.meta.store;

							const keys = await store.keys('*Sirviente del Mal*');
							return game.outPutCreateRaw(
								'Joven muchacho, ¿deseas firmar mi bola de cristal?\n' +
								'Para hacerlo, dime “firmar mensaje” (sin las comillas), y tu mensaje ' +
								'aparecerá en mi bola de cristal.',
								null,
								{
									command: 'mensajesGlobales',
									list: [{
										id: 'ver',
										name: 'Ver mensajes'
									}]
								}
							);
						} else {
							return game.outPutCreateRaw('La bruja está durmiendo');
						}
						// gameReset(game);
						// game.roomSetCurrent('Inicio');
						// return game.outPutCreateFromRoom(game.roomGetCurrent());
					},
				}
			},
			exits: {
				'Castillo': 'Castillo'
			}
		},
	}
};