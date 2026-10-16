import Foundation
import Combine

struct BriefSource: Codable, Hashable {
    let name: String
    let url: String
}

struct Brief: Codable, Identifiable, Hashable {
    let id: String
    let title: String
    let summary: String
    let context: String
    let caveat: String
    let topic: String
    let format: String
    let date: String?
    let image: String?
    let video: String?
    let path: String
    let sources: [BriefSource]
    let aiLabel: String
    let transcript: String?
    let credits: String?

    static func secureURL(_ value: String?) -> URL? {
        guard let value, !value.hasPrefix("//"),
              let url = URL(string: value, relativeTo: URL(string: "https://app.aibroadsheet.com")!)?.absoluteURL,
              url.scheme == "https", url.user == nil, url.password == nil else { return nil }
        return url
    }
    var shareURL: URL {
        let host = path.hasPrefix("/app?") || path.hasPrefix("/fr/app?") ? "https://app.aibroadsheet.com" : "https://aibroadsheet.com"
        guard path.hasPrefix("/"), !path.hasPrefix("//"), let url = URL(string: host + path) else {
            return URL(string: "https://app.aibroadsheet.com/app")!
        }
        return url
    }
}

struct BriefFeed: Codable {
    let version: Int
    let fetchedAt: String
    let items: [Brief]
}

@MainActor final class BriefStore: ObservableObject {
    @Published var items: [Brief] = []
    @Published var saved: [Brief] = []
    @Published var loading = false
    @Published var status = ""
    private let directory: URL
    private let decoder = JSONDecoder()
    private let encoder = JSONEncoder()

    init(directory: URL? = nil) {
        self.directory = directory ?? FileManager.default.urls(for: .applicationSupportDirectory, in: .userDomainMask)[0].appendingPathComponent("TheBrief")
        try? FileManager.default.createDirectory(at: self.directory, withIntermediateDirectories: true)
        if let data = try? Data(contentsOf: self.directory.appendingPathComponent("saved.json")),
           let saved = try? decoder.decode([Brief].self, from: data) { self.saved = Array(saved.prefix(100)) }
        if let data = try? Data(contentsOf: self.directory.appendingPathComponent("feed.json")),
           let feed = try? decoder.decode(BriefFeed.self, from: data) {
            items = feed.items
            status = "Saved feed · refresh for updates"
        }
    }
    func isSaved(_ item: Brief) -> Bool { saved.contains { $0.id == item.id } }
    func toggle(_ item: Brief) {
        if isSaved(item) { saved.removeAll { $0.id == item.id } }
        else { saved.insert(item, at: 0); saved = Array(saved.prefix(100)) }
        persistSaved()
    }
    private func persistSaved() {
        do { try encoder.encode(saved).write(to: directory.appendingPathComponent("saved.json"), options: [.atomic, .completeFileProtectionUntilFirstUserAuthentication]) }
        catch { status = "Could not save on this device. Check available storage." }
    }
    func clearSaved() { saved = []; persistSaved() }
    func refresh() async {
        guard !loading else { return }
        loading = true
        defer { loading = false }
        do {
            var request = URLRequest(url: URL(string: "https://app.aibroadsheet.com/api/brief.json")!)
            request.timeoutInterval = 15
            let (data, response) = try await URLSession.shared.data(for: request)
            guard (response as? HTTPURLResponse)?.statusCode == 200, data.count < 3_000_000 else { throw URLError(.badServerResponse) }
            let feed = try decoder.decode(BriefFeed.self, from: data)
            guard feed.version == 1 else { throw URLError(.cannotParseResponse) }
            items = feed.items
            status = "Updated just now"
            try? data.write(to: directory.appendingPathComponent("feed.json"), options: [.atomic, .completeFileProtectionUntilFirstUserAuthentication])
        } catch {
            status = items.isEmpty ? "Couldn’t load the feed. Check your connection and try again." : "Offline · showing the saved feed"
        }
    }
}
