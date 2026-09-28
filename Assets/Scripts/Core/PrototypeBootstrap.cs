using UnityEngine;
using UnityEngine.UI;
using MotoEntrega3D.Delivery;
using MotoEntrega3D.Player;
using MotoEntrega3D.UI;
using MotoEntrega3D.World;

namespace MotoEntrega3D.Core
{
    public class PrototypeBootstrap : MonoBehaviour
    {
        private void Start()
        {
            BuildWorld();
        }

        private void BuildWorld()
        {
            CreateObject("GameManager", Vector3.zero, typeof(GameManager));
            
            var pickup = CreatePoint("Restaurante Central", new Vector3(12f, 0.5f, 18f));
            var customer = CreatePoint("Cliente", new Vector3(-22f, 0.5f, -16f));

            var deliveryObject = CreateObject("DeliveryManager", Vector3.zero, typeof(DeliveryManager));
            var delivery = deliveryObject.GetComponent<DeliveryManager>();
            SetPrivateField(delivery, "pickupPoint", pickup.transform);
            SetPrivateField(delivery, "customerPoint", customer.transform);

            CreateGround();
            CreateRoads();
            CreateBike();
            CreateCamera();
            CreateHUD(deliveryObject);
        }

        private GameObject CreateObject(string name, Vector3 position, params System.Type[] components)
        {
            var go = new GameObject(name);
            go.transform.position = position;
            foreach (var type in components)
                go.AddComponent(type);
            return go;
        }

        private GameObject CreatePoint(string name, Vector3 position)
        {
            var go = GameObject.CreatePrimitive(PrimitiveType.Cylinder);
            go.name = name;
            go.transform.position = position;
            go.transform.localScale = new Vector3(2f, 0.15f, 2f);
            go.AddComponent<DeliveryZone>();
            return go;
        }

        private void CreateGround()
        {
            var ground = GameObject.CreatePrimitive(PrimitiveType.Plane);
            ground.name = "Cidade - Terreno";
            ground.transform.localScale = new Vector3(8f, 1f, 8f);
        }

        private void CreateRoads()
        {
            for (int i = -3; i <= 3; i++)
            {
                var road = GameObject.CreatePrimitive(PrimitiveType.Cube);
                road.name = "Rua";
                road.transform.position = new Vector3(i * 10f, 0.02f, 0f);
                road.transform.localScale = new Vector3(5f, 0.05f, 80f);

                var cross = GameObject.CreatePrimitive(PrimitiveType.Cube);
                cross.name = "Avenida";
                cross.transform.position = new Vector3(0f, 0.025f, i * 10f);
                cross.transform.localScale = new Vector3(80f, 0.05f, 5f);
            }
        }

        private void CreateBike()
        {
            var bike = GameObject.CreatePrimitive(PrimitiveType.Capsule);
            bike.name = "Moto do Entregador";
            bike.tag = "Player";
            bike.transform.position = new Vector3(0f, 1f, -5f);
            bike.transform.localScale = new Vector3(0.65f, 0.55f, 1.4f);
            bike.AddComponent<Rigidbody>();
            bike.AddComponent<MotorcycleController>();
        }

        private void CreateCamera()
        {
            var cameraObject = new GameObject("Main Camera");
            cameraObject.tag = "MainCamera";
            var camera = cameraObject.AddComponent<Camera>();
            cameraObject.AddComponent<AudioListener>();
            cameraObject.transform.position = new Vector3(0f, 6f, -10f);
            cameraObject.transform.rotation = Quaternion.Euler(20f, 0f, 0f);

            var follow = cameraObject.AddComponent<ThirdPersonCamera>();
            follow.Target = GameObject.FindGameObjectWithTag("Player").transform;
        }

        private void CreateHUD(GameObject deliveryObject)
        {
            var canvasObject = new GameObject("HUD");
            var canvas = canvasObject.AddComponent<Canvas>();
            canvas.renderMode = RenderMode.ScreenSpaceOverlay;
            canvasObject.AddComponent<CanvasScaler>();
            canvasObject.AddComponent<GraphicRaycaster>();

            var hud = canvasObject.AddComponent<DeliveryHUD>();

            CreateText(canvasObject.transform, "Moto Entrega 3D", new Vector2(0, 190), 32);
            var order = CreateText(canvasObject.transform, "Nenhum pedido", new Vector2(0, 135), 24);
            var money = CreateText(canvasObject.transform, "R$ 0,00", new Vector2(-280, 190), 24);
            var timer = CreateText(canvasObject.transform, "--:--", new Vector2(280, 190), 24);
            var speed = CreateText(canvasObject.transform, "0 km/h", new Vector2(0, -190), 22);

            var buttonObject = new GameObject("Iniciar Entrega");
            buttonObject.transform.SetParent(canvasObject.transform);
            var button = buttonObject.AddComponent<Button>();
            var image = buttonObject.AddComponent<Image>();
            button.targetGraphic = image;
            buttonObject.GetComponent<RectTransform>().sizeDelta = new Vector2(300, 80);
            buttonObject.GetComponent<RectTransform>().anchoredPosition = new Vector2(0, -80);

            var label = CreateText(buttonObject.transform, "INICIAR ENTREGA", Vector2.zero, 22);
            label.alignment = TextAnchor.MiddleCenter;

            button.onClick.AddListener(hud.StartDelivery);

            SetPrivateField(hud, "orderText", order);
            SetPrivateField(hud, "moneyText", money);
            SetPrivateField(hud, "timerText", timer);
            SetPrivateField(hud, "speedText", speed);
            SetPrivateField(hud, "startButton", button);
        }

        private Text CreateText(Transform parent, string value, Vector2 position, int size)
        {
            var go = new GameObject("Text");
            go.transform.SetParent(parent);
            var rect = go.AddComponent<RectTransform>();
            rect.sizeDelta = new Vector2(600, 60);
            rect.anchoredPosition = position;
            var text = go.AddComponent<Text>();
            text.text = value;
            text.font = Resources.GetBuiltinResource<Font>("LegacyRuntime.ttf");
            text.fontSize = size;
            text.alignment = TextAnchor.MiddleCenter;
            return text;
        }

        private void SetPrivateField(object target, string fieldName, object value)
        {
            var field = target.GetType().GetField(
                fieldName,
                System.Reflection.BindingFlags.Instance |
                System.Reflection.BindingFlags.NonPublic);

            if (field != null)
                field.SetValue(target, value);
        }
    }
}
