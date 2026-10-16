import SwiftUI
import AVKit

@main struct TheBriefApp: App {
    @StateObject private var store = BriefStore()
    var body: some Scene {
        WindowGroup { RootView().environmentObject(store).preferredColorScheme(.dark).tint(.orange) }
    }
}

struct RootView: View {
    @EnvironmentObject var store: BriefStore
    var body: some View {
        TabView {
            FeedView().tabItem { Label("Brief", systemImage: "newspaper") }
            ShortsView().tabItem { Label("Watch", systemImage: "play.rectangle") }
            SavedView().tabItem { Label("Saved", systemImage: "bookmark") }
            AboutView().tabItem { Label("About", systemImage: "info.circle") }
        }.task { await store.refresh() }
    }
}

struct FeedView: View {
    @EnvironmentObject var store: BriefStore
    @State private var query = ""
    @State private var topic: String?
    private var filtered: [Brief] {
        store.items.filter { (topic == nil || $0.topic == topic) && (query.isEmpty || ($0.title + " " + $0.summary).localizedCaseInsensitiveContains(query)) }
    }
    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 20) {
                    Text("AI NEWS. HUMAN STAKES.").font(.caption.weight(.bold)).tracking(2).foregroundStyle(.orange)
                    ScrollView(.horizontal, showsIndicators: false) {
                        HStack(spacing: 18) {
                            topicButton("All", value: nil)
                            ForEach(Array(Set(store.items.map(\.topic))).sorted(), id: \.self) { item in topicButton(item, value: item) }
                        }
                    }
                    HStack { Text(store.status).font(.caption).foregroundStyle(.secondary); Spacer(); if store.loading { ProgressView() } }
                    if filtered.isEmpty && !store.loading {
                        ContentUnavailableView("No briefs here yet", systemImage: "newspaper", description: Text("Try another topic or refresh the feed."))
                        Button("Refresh") { Task { await store.refresh() } }
                    }
                    LazyVStack(spacing: 24) {
                        ForEach(filtered) { item in
                            NavigationLink { DetailView(item: item) } label: { StoryCard(item: item) }.buttonStyle(.plain)
                        }
                    }
                }.padding()
            }.navigationTitle("The Brief").searchable(text: $query, prompt: "Search this feed")
                .refreshable { await store.refresh() }
        }
    }
    private func topicButton(_ title: String, value: String?) -> some View {
        Button { topic = value } label: {
            VStack(spacing: 7) {
                Image(systemName: value == nil ? "sparkle.magnifyingglass" : "newspaper.fill")
                    .font(.title2).frame(width: 62, height: 62)
                    .background(.white.opacity(0.06), in: Circle())
                    .overlay(Circle().stroke(topic == value ? Color.orange : Color.white.opacity(0.25), lineWidth: 2))
                Text(title).font(.caption).lineLimit(2).frame(width: 80)
            }
        }.buttonStyle(.plain).accessibilityAddTraits(topic == value ? .isSelected : [])
    }
}

struct StoryCard: View {
    let item: Brief
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            if let url = Brief.secureURL(item.image) {
                AsyncImage(url: url) { image in image.resizable().scaledToFill() } placeholder: {
                    Rectangle().fill(.white.opacity(0.05)).overlay(Image(systemName: "newspaper").font(.largeTitle))
                }.frame(height: 220).clipped().clipShape(RoundedRectangle(cornerRadius: 18))
            }
            Text(item.topic.uppercased()).font(.caption.bold()).foregroundStyle(.orange)
            Text(item.title).font(.system(.title, design: .serif, weight: .bold))
            Text(item.summary).font(.body).foregroundStyle(.secondary)
            Text(item.aiLabel).font(.caption2).foregroundStyle(.secondary)
            Label("Read the evidence", systemImage: "arrow.up.right").font(.caption.bold())
        }.padding(18).background(.white.opacity(0.04), in: RoundedRectangle(cornerRadius: 24))
    }
}

struct DetailView: View {
    @EnvironmentObject var store: BriefStore
    let item: Brief
    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 22) {
                StoryCard(item: item)
                if let video = Brief.secureURL(item.video) { BriefPlayer(url: video).frame(height: 380) }
                Text("The context").font(.headline)
                Text(item.context).textSelection(.enabled)
                Text("What to keep in mind").font(.headline)
                Text(item.caveat).foregroundStyle(.secondary)
                if let date = item.date { Text("Published: " + date).font(.caption).foregroundStyle(.secondary) }
                Text("Sources").font(.headline)
                ForEach(item.sources, id: \.self) { source in
                    if let url = Brief.secureURL(source.url) { Link(source.name, destination: url) }
                }
                if let credits = item.credits, !credits.isEmpty { Text(credits).font(.caption).foregroundStyle(.secondary) }
                if let transcript = item.transcript, !transcript.isEmpty {
                    DisclosureGroup("Transcript") { Text(transcript).textSelection(.enabled) }
                }
                Link("Full story on AI Broadsheet", destination: item.shareURL)
                Link("Report a correction", destination: URL(string: "https://aibroadsheet.com/corrections")!)
            }.padding()
        }.navigationTitle("The evidence").navigationBarTitleDisplayMode(.inline)
            .toolbar {
                Button { store.toggle(item) } label: { Image(systemName: store.isSaved(item) ? "bookmark.fill" : "bookmark") }
                    .accessibilityLabel(store.isSaved(item) ? "Remove saved story" : "Save story for offline reading")
                ShareLink(item: item.shareURL, subject: Text(item.title))
            }
    }
}

struct BriefPlayer: View {
    let url: URL
    @State private var player: AVPlayer?
    @Environment(\.scenePhase) private var phase
    var body: some View {
        VideoPlayer(player: player)
            .onAppear { player = AVPlayer(url: url) }
            .onDisappear { player?.pause(); player = nil }
            .onChange(of: phase) { _, value in if value != .active { player?.pause() } }
            .accessibilityLabel("Video player. Playback starts when you press play.")
    }
}

struct ShortsView: View {
    @EnvironmentObject var store: BriefStore
    var body: some View {
        NavigationStack {
            let videos = store.items.filter { Brief.secureURL($0.video) != nil }
            if videos.isEmpty {
                ContentUnavailableView("No videos loaded", systemImage: "play.rectangle", description: Text("Refresh the Brief tab to load the latest videos."))
            } else {
                ScrollView {
                    LazyVStack(spacing: 0) {
                        ForEach(videos) { item in
                            VStack(alignment: .leading, spacing: 14) {
                                BriefPlayer(url: Brief.secureURL(item.video)!).frame(maxHeight: .infinity)
                                Text(item.title).font(.title2.bold())
                                Text(item.aiLabel).font(.caption).foregroundStyle(.secondary)
                                HStack {
                                    NavigationLink("Sources & transcript") { DetailView(item: item) }
                                    Spacer()
                                    Button { store.toggle(item) } label: { Image(systemName: store.isSaved(item) ? "bookmark.fill" : "bookmark") }.accessibilityLabel("Save video")
                                    ShareLink(item: item.shareURL)
                                }
                            }.padding().containerRelativeFrame(.vertical)
                        }
                    }.scrollTargetLayout()
                }.scrollTargetBehavior(.paging).navigationTitle("Watch").navigationBarTitleDisplayMode(.inline)
            }
        }
    }
}

struct SavedView: View {
    @EnvironmentObject var store: BriefStore
    var body: some View {
        NavigationStack {
            if store.saved.isEmpty { ContentUnavailableView("Your reading shelf", systemImage: "bookmark", description: Text("Save briefs to read their text and sources offline. Videos and images still need a connection.")) }
            else {
                List(store.saved) { item in
                    NavigationLink { DetailView(item: item) } label: {
                        VStack(alignment: .leading) { Text(item.title).font(.headline); Text(item.topic).font(.caption).foregroundStyle(.secondary) }
                    }.swipeActions { Button("Remove", role: .destructive) { store.toggle(item) } }
                }.navigationTitle("Saved")
            }
        }
    }
}

struct AboutView: View {
    @EnvironmentObject var store: BriefStore
    @State private var confirmClear = false
    var body: some View {
        NavigationStack {
            Form {
                Section("AI Broadsheet") {
                    Text("AI news. Human stakes.").font(.title2.bold())
                    Text("Short explanations. Named sources. Corrections in public. AI-assisted journalism with human editorial responsibility.")
                    Text("Editor: Jack Guler")
                    Link("Our values", destination: URL(string: "https://aibroadsheet.com/values")!)
                    Link("Editorial standards", destination: URL(string: "https://aibroadsheet.com/standards")!)
                }
                Section("Your device") {
                    Text("Saved briefs stay on this device. No account, advertising SDK or tracking SDK is included. Loading news and media makes network requests to AI Broadsheet and its content hosts.")
                    Button("Clear saved briefs", role: .destructive) { confirmClear = true }
                }
                Section("Contact & privacy") {
                    Link("Privacy policy", destination: URL(string: "https://aibroadsheet.com/privacy")!)
                    Link("Corrections", destination: URL(string: "https://aibroadsheet.com/corrections")!)
                    Link("hello@aibroadsheet.com", destination: URL(string: "mailto:hello@aibroadsheet.com")!)
                }
            }.navigationTitle("About")
                .confirmationDialog("Clear your saved briefs?", isPresented: $confirmClear) {
                    Button("Clear saved briefs", role: .destructive) { store.clearSaved() }
                }
        }
    }
}
