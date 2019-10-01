
(function() {
  
  function Mark(material) {
    this.constructor(new THREE.SphereGeometry(.2, 30), material)

    var outline = new THREE.Mesh(
      this.geometry,
      new THREE.MeshPhongMaterial( { color: 0xff0000, side: THREE.BackSide } )
    )
    outline.scale.multiplyScalar(1.2)
    outline.visible = false
    this.add(outline)

    this.mark = function(color) {
      outline.visible = !!color

      if(["string", "number"].includes(typeof color)) {
        outline.material.color.set(color)
      }
    }

  }
  Mark.prototype = Object.create(THREE.Mesh.prototype)

  function ArcHelper(radius, angle1, angle2) {

    
    var geometry = new THREE.BufferGeometry()
    var material = new THREE.LineBasicMaterial({color: 0x888888, linewidth: 3})

    this.constructor(geometry, material)

    this.radius = radius
    if(angle1 && angle2) 
      this.setAngles(angle1, angle2)

  }
  ArcHelper.prototype = Object.create( THREE.LineSegments.prototype )
  ArcHelper.prototype.setAngles = function(angle1, angle2) {

    if(angle1 > angle2) angle1 -= Math.PI*2

    if(this.geometry.getAttribute('position'))
      this.geometry.removeAttribute('position')

    var vertices = []

    var step = Math.PI/180
    for(var a = angle1; a < angle2; a += step) {

      vertices.push(Math.cos(a) * this.radius, 0, -Math.sin(a) * this.radius)
      vertices.push(Math.cos(a+step) * this.radius, 0, -Math.sin(a+step) * this.radius)

    }

    this.geometry.addAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) )

  }

  var three = new THREE.DefaultScene(document.body)

  var arrow1 = new THREE.ArrowHelper
  var arrow2 = new THREE.ArrowHelper
  arrow1.setLength(4)
  arrow2.setLength(4)

  var arcHelper = new ArcHelper(3)
  three.scene.add(arcHelper)

  var sph1 = new Mark(new THREE.MeshPhongMaterial({color: 'green'}))
  var sph2 = new Mark(new THREE.MeshPhongMaterial({color: 'green'}))
  var sph3 = new Mark(new THREE.MeshPhongMaterial({color: 'blue'}))

  var dir1 = sph1.position
  var dir2 = sph2.position
  var pos  = sph3.position

  watchVec(dir1, getEvenets(arrow1, dir1))
  watchVec(dir2, getEvenets(arrow2, dir2))

  dir1.set(3, 0, -3)
  dir2.set(-3, 0, -3)
  pos.set(-2, 0, 0)

  var plane = new THREE.Plane(new THREE.Vector3(0, 1, 0))
  var raycaster = new THREE.Raycaster

  three.scene.add(arrow1, arrow2, sph1, sph2, sph3)

  var obj = false
  var objs = [sph1, sph2, sph3]
  three.renderer.domElement.addEventListener('mousemove', function(event) {
    
    raycaster.setFromCamera( new THREE.Vector2(
      ( event.clientX / window.innerWidth ) * 2 - 1,
      - ( event.clientY / window.innerHeight ) * 2 + 1
    ), three.camera );

    if(obj) {

      var res = raycaster.ray.intersectPlane(plane, new THREE.Vector3)
      // obj.x = res.x
      // obj.z = res.z
      obj.position.copy(res)

    } else {
      
      objs.forEach(o => o.mark(false))

      var info = raycaster.intersectObjects(objs)

      if(info[0]) info[0].object.mark('red')

    }


  }, false)
  three.renderer.domElement.addEventListener('mousedown', function(e) {

    objs.forEach(o => o.mark(false))

    var info = raycaster.intersectObjects(objs)

    if(info[0]) {

      info[0].object.mark('green')
      obj = info[0].object

    }

  }, false)
  three.renderer.domElement.addEventListener('mouseup', function(e) {

    if(obj) {
      obj.mark('red')
      obj = false
    }

  }, false)

  function watchVec(v, events) {

    var props = {}

    for(let k of Object.keys(events)) {

      events[k] = events[k].bind(v)

      v['_'+k] = v[k]

      props[k] = {
        get() {
          return v['_'+k]
        },
        set(val) {
          v['_'+k] = val
          events[k]()
        }
      }

    }

    Object.defineProperties(v, props)

  }

  function getEvenets(a, v) {
    return {
      x() { a.setDirection(v.clone().normalize()); calcArcHelper(); },
      y() { a.setDirection(v.clone().normalize()); calcArcHelper(); },
      z() { a.setDirection(v.clone().normalize()); calcArcHelper(); }
    }
  }

  function calcArcHelper() {

    var v1 = dir1.clone().normalize()
    var v2 = dir2.clone().normalize()

    var v = new THREE.Vector2
    
    v.set(v1.x, -v1.z)
    var a1 = v.angle()
    v.set(v2.x, -v2.z)
    var a2 = v.angle()

    arcHelper.setAngles(a1, a2)

  }

})()
